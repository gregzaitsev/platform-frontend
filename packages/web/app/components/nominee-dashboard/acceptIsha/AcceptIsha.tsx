import * as React from "react";
import Dropzone from "react-dropzone";
import { FormattedMessage } from "react-intl-phraseapp";
import * as cn from "classnames";

import { compose } from "recompose";
import { appConnect } from "../../../store";
import { selectIshaLoading } from "../../../modules/nominee-flow/selectors";
import { actions } from "../../../modules/actions";
import { InlineIcon } from "../../shared/icons/InlineIcon";

import * as styles from "../../eto/shared/EtoAddDocument.module.scss";
import * as addFileIcon from "../../../assets/img/inline_icons/add_file.svg";

type TProps = {
  onDrop: (accepted: File)=>void;
  loading: boolean
}

export const AcceptIshaLayout: React.FunctionComponent<TProps> = ({onDrop, loading}) => {
  const onDropFile = (accepted: File[]) => {console.log(accepted); return accepted[0] && onDrop(accepted[0])};
  return <>
    <h4>
      <FormattedMessage id="nominee.upload-isha.title" />
    </h4>
    <p>
      <FormattedMessage id="nominee.upload-isha.text" />
    </p>
    <Dropzone
      data-test-id="eto-add-document-drop-zone"
      onDrop={onDropFile}
      activeClassName={styles.invisible}
      acceptClassName={styles.invisible}
      rejectClassName={styles.invisible}
      disabledClassName={cn(styles.dropzoneDisabled, styles.invisible)}
      className={cn(styles.dropzone, styles.invisible)}
      // disabled={loading}
    >
      <br />
      <InlineIcon svgIcon={addFileIcon} />
    </Dropzone>
  </>;
};

export const AcceptIsha = compose<TProps,{}>(
  appConnect({
    stateToProps: s => ({
      loading: selectIshaLoading(s)
    }),
    dispatchToProps: d => ({
      onDrop: (isha: File) => d(actions.nomineeFlow.startAcceptIsha(isha))
    })
  })
)(AcceptIshaLayout);
