import { storiesOf } from "@storybook/react";
import { Formik } from "formik";
import * as React from "react";

import { Form } from "../Form";
import { FormField } from "./FormField";

storiesOf("forms/fields/Field", module)
  .add("default", () => (
    <Formik initialValues={{}} onSubmit={() => {}}>
      {() => (
        <Form>
          <FormField label="Form field" name="value" />
        </Form>
      )}
    </Formik>
  ))
  .add("with suffix", () => (
    <Formik initialValues={{}} onSubmit={() => {}}>
      {() => (
        <Form>
          <FormField label="Form field" name="value" suffix="%" />
        </Form>
      )}
    </Formik>
  ))
  .add("with prefix", () => (
    <Formik initialValues={{}} onSubmit={() => {}}>
      {() => (
        <Form>
          <FormField label="Form field" name="value" prefix="@" />
        </Form>
      )}
    </Formik>
  ))
  .add("disabled", () => (
    <Formik initialValues={{}} onSubmit={() => {}}>
      {() => (
        <Form>
          <FormField label="Form field" name="value" disabled={true} />
        </Form>
      )}
    </Formik>
  ));
