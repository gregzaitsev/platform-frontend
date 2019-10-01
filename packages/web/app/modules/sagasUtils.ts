import { isMatch } from "lodash/fp";
import { delay } from "redux-saga";
import {
  call,
  CallEffectFn,
  Effect,
  fork,
  getContext,
  race,
  spawn,
  take,
  takeEvery,
  takeLatest,
  throttle,
} from "redux-saga/effects";

import { TGlobalDependencies } from "../di/setupBindings";
import { TSingleOrArray } from "../types";
import { TActionPayload, TPattern } from "./actions";

type TSagaWithDeps = (deps: TGlobalDependencies, ...args: any[]) => any;
type TSagaWithDeps2<R, T extends any[]> = (deps: TGlobalDependencies, ...args: T) => R;

type TType = TSingleOrArray<TPattern>;

export function* neuTakeLatest(type: TType, saga: TSagaWithDeps): Iterator<Effect> {
  const deps: TGlobalDependencies = yield getContext("deps");
  yield takeLatest(type, saga, deps);
}

export function* neuTakeEvery(type: TType, saga: TSagaWithDeps): Iterator<Effect> {
  const deps: TGlobalDependencies = yield getContext("deps");
  yield takeEvery(type, saga, deps);
}

export function* neuFork(saga: TSagaWithDeps, ...args: any[]): Iterator<Effect> {
  const deps: TGlobalDependencies = yield getContext("deps");
  return yield fork(saga, deps, args[0], args[1], args[2], args[3], args[4]);
}

export function* neuSpawn(saga: TSagaWithDeps, ...args: any[]): Iterator<Effect> {
  const deps: TGlobalDependencies = yield getContext("deps");
  return yield spawn(saga, deps, args[0], args[1], args[2], args[3], args[4]);
}

export function* neuCall<R, T extends any[] = []>(
  saga: TSagaWithDeps2<R, T>,
  ...args: T
): Iterator<Effect> {
  const deps: TGlobalDependencies = yield getContext("deps");
  // TODO: remove casting after migration to redux-saga 1.*
  return yield call(saga as CallEffectFn<any>, deps, args[0], args[1], args[2], args[3], args[4]);
}

/**
 * Starts saga on `startAction`, cancels on `stopAction`, loops...
 */
export function* neuTakeUntil(startAction: TType, stopAction: TType, saga: TSagaWithDeps): any {
  while (true) {
    const action = yield take(startAction);
    // No direct concurrent requests like `fork` or `spawn` should be in the loop
    yield race({
      task: neuCall(saga, action),
      cancel: take(stopAction),
    });
  }
}

/**
 * Starts saga on `startAction`, cancels on `stopAction`, loops...
 */
export function* neuTakeLatestUntil(
  startAction: TType,
  stopAction: TType,
  saga: TSagaWithDeps,
): any {
  yield takeLatest(startAction, function*(payload): Iterator<any> {
    yield race({
      task: neuCall(saga, payload),
      cancel: take(stopAction),
    });
  });
}

/**
 *  Awaits an Action with specific payload.
 *  You can pass only a part of the payload that you want to match.
 */
export function* neuTakeOnly<T extends TPattern>(
  type: T,
  payload: Partial<TActionPayload<T>>,
): any {
  while (true) {
    const takenAction = yield take(type);
    if (isMatch(payload, takenAction.payload)) {
      return takenAction;
    }
  }
}

/**
 *  Executes the generator and repeats if repeatAction was dispatched. Exits when endAction
 *  is dispatched.
 */
export function* neuRepeatIf(
  repeatAction: TType,
  endAction: TType,
  generator: TSagaWithDeps,
  ...args: any[]
): any {
  while (true) {
    yield neuCall(generator, ...args);

    const { repeat, end } = yield race({
      repeat: take(repeatAction),
      end: take(endAction),
    });
    if (repeat) {
      continue;
    }
    if (end) {
      return;
    }
  }
}

/**
 *  Executes the generator and restarts running job if a specific actions is fired
 */
export function* neuRestartIf(cancelAction: TType, saga: TSagaWithDeps, ...args: any[]): any {
  while (true) {
    yield race({
      task: neuCall(saga, ...args),
      cancel: take(cancelAction),
    });
  }
}

/**
 * Ignore incoming actions for a given period of time while processing a task.
 * After spawning a task, it's still accepting incoming actions into the underlying buffer, keeping at most 1.
 */
export function* neuThrottle(ms: number, type: TType, saga: TSagaWithDeps): Iterator<Effect> {
  const deps: TGlobalDependencies = yield getContext("deps");
  yield throttle(ms, type, saga, deps);
}

function* next(ms: number, task: any, ...args: any[]): any {
  yield delay(ms);
  yield neuCall(task, ...args);
}

// TODO: Add tests for debounce
export function* neuDebounce(
  ms: number,
  pattern: TType,
  task: TSagaWithDeps,
  ...args: any[]
): Iterator<Effect> {
  yield (takeLatest as any)(pattern, next, ms, task, ...args);
}
