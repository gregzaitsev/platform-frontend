import InlineEditor from "@ckeditor/ckeditor5-build-inline";
import CKEditor from "@ckeditor/ckeditor5-react";
import * as cn from "classnames";
import { difference } from "lodash";
import * as React from "react";

import { CommonHtmlProps, Primitive } from "../../../../types";
import { SANITIZER_OPTIONS } from "../../SanitizedHtml";
import { generateErrorId } from "../fields/FormFieldError";
import { generateLabelId } from "../fields/FormFieldLabel";

import * as fieldStyles from "../../Field.module.scss";
import * as styles from "./RichTextAreaLayout.module.scss";

type TExternalProps = {
  invalid?: boolean;
  name: string;
  placeholder?: string;
  onChange: (value: string) => void;
  value?: string;
  disabled?: boolean;
};

type Element = keyof HTMLElementTagNameMap;

const areTagsAllowed = (...tags: Element[]) =>
  difference(tags, SANITIZER_OPTIONS.allowedTags).length === 0;

const toolbar = [
  areTagsAllowed("h2", "h3", "h4") && "heading",
  areTagsAllowed("h2", "h3", "h4") && "|",
  areTagsAllowed("strong") && "bold",
  areTagsAllowed("i") && "italic",
  areTagsAllowed("a") && "link",
  areTagsAllowed("ul", "li") && "bulletedList",
  areTagsAllowed("ol", "li") && "numberedList",
].filter(Boolean);

type TCkEditorWriter = {
  setAttribute(attr: string, value: Primitive, element: unknown): void;
};

type TCkEditor = {
  getData(): string;
  editing: {
    view: {
      change(callback: (writer: TCkEditorWriter) => void): void;
      document: {
        getRoot(): unknown;
      };
    };
  };
};

const RichTextAreaLayout: React.FunctionComponent<TExternalProps & CommonHtmlProps> = ({
  name,
  invalid,
  disabled,
  value,
  onChange,
  placeholder,
}) => {
  const editorRef = React.useRef<TCkEditor>();

  React.useEffect(() => {
    const editor = editorRef.current;

    if (editor) {
      const view = editor.editing.view;

      view.change(writer => {
        const viewEditableRoot = view.document.getRoot();

        writer.setAttribute("aria-describedby", generateErrorId(name), viewEditableRoot);
        writer.setAttribute("aria-invalid", invalid, viewEditableRoot);
        writer.setAttribute("aria-labeledby", generateLabelId(name), viewEditableRoot);
        writer.setAttribute("aria-multiline", true, viewEditableRoot);

        if (process.env.IS_CYPRESS || process.env.NODE_ENV === "development") {
          writer.setAttribute("data-test-id", `form.name.${name}`, viewEditableRoot);
        }

        writer.setAttribute("id", name, viewEditableRoot);
      });
    }
  }, [invalid, name, editorRef.current]);

  return (
    <div
      className={cn(styles.richTextArea, fieldStyles.richField, {
        [styles.richTextAreaInvalid]: invalid,
      })}
    >
      <CKEditor
        config={{
          placeholder,
          toolbar: [...toolbar, "undo", "redo"],
        }}
        editor={InlineEditor}
        disabled={disabled}
        data={value}
        onInit={(editor: TCkEditor) => {
          editorRef.current = editor;
        }}
        onChange={(_: unknown, editor: TCkEditor) => {
          onChange(editor.getData());
        }}
      />
    </div>
  );
};

export { RichTextAreaLayout };
