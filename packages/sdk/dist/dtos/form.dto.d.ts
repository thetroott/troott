import Entry from "@/dtos/entry.dto";
import Hackathon from "@/dtos/hackathon.dto";
import Submission from "@/dtos/submission.dto";
import User from "@/dtos/user.dto";
interface Form {
    code: string;
    name: string;
    status: FormStatusType;
    hasDraftBlocks: boolean;
    index: number;
    timeZone: string;
    type: FormType;
    blocks: Array<IBlock>;
    questions: Array<IQuestion>;
    numberOfEntries: number;
    numberOfSubmissions: number;
    settings: IFormSettings;
    styles: Record<string, any>;
    hackathon: Hackathon | any;
    entries: Array<Entry | any>;
    submission: Array<Submission | any>;
    createdAt: Date;
    updatedAt: Date;
    _version: number;
    _id: any;
    id: any;
}
export interface IFormSettings {
    language: string;
    isClosed: boolean;
    closeTime: string;
    closeDate: string;
    closeTimeZone: string;
    closeMessageTitle: string;
    closeMessageDescription: string;
    submissionLimit: number;
}
export declare enum FormStatusType {
    BLANK = "blank",
    DRAFT = "draft",
    DELETED = "deleted",
    PUBLISHED = "published",
    ARCHIVED = "archived",
    TEMPLATE = "template"
}
export declare enum FormType {
    REGISTRATION = "hackathon-registration",
    ENTRIES = "hackathon-entries",
    SUBMISSION = "hackathon-submission",
    ENTRIES_AND_SUBMISSION = "hackathon-entries-and-submission",
    FEEDBACK = "hackathon-feedback",
    MENTOR = "hackathon-mentor",
    JUDGING = "hackathon-judging"
}
export interface IBlock {
    code: string;
    name: string;
    type: BlockType;
    description: string;
    groupId: string;
    groupType: BlockType;
    question: IQuestion | any;
    payload: IBlockPayload;
    styles: Record<string, any>;
    isAnswerable: boolean;
    isReadOnly: boolean;
    isHidden: boolean;
}
export interface IBlockPayload {
    isRequired: boolean;
    isFirst: boolean;
    isLast: boolean;
    index: number;
    placeholder: string;
    text: string;
    value: string;
    options: Array<string>;
    columnid: string;
    colunmListId: string;
    columnRatio: number;
    safeHTMLSchema: Array<[string, Array<[string, string]>] | [string]>;
    isThankYouPage: boolean;
    isQualifiedForThankYouPage: boolean;
}
export interface IQuestion {
    code: string;
    fields: Array<IBlock>;
    questionType: IBlock;
    options: Array<string>;
    isRequired: boolean;
    isFirst: boolean;
    isLast: boolean;
    index: number;
    numberOfResponses: number;
    hasResponses: boolean;
}
export interface IResponse {
    code: string;
    answer: string;
    respondent: User;
    question: IQuestion;
    form: Form;
}
export declare enum BlockType {
    FORM_TITLE = "form-title",
    TITLE = "title",
    LABEL = "label",
    TEXT = "text",
    HEADING_1 = "heading-1",
    HEADING_2 = "heading-2",
    HEADING_3 = "heading-3",
    DIVIDER = "divider",
    PAGE_BREAK = "page-break",
    THANK_YOU_PAGE = "thank-you-page",
    QUESTION = "question",
    INPUT_TEXT = "input-text",
    INPUT_EMAIL = "input-email",
    INPUT_PHONE_NUMBER = "input-phone-number",
    INPUT_LINK = "input-link",
    INPUT_DATE = "input-date",
    INPUT_TIME = "input-time",
    INPUT_DATETIME = "input-datetime",
    TEXTAREA = "textarea",
    BOOLEAN = "boolean",
    SELECT = "select",
    DROPDOWN = "dropdown",
    CHECKBOXES = "checkboxes",
    RADIO = "radio",
    MULTI_SELECT = "multi-select",
    MULTIPLE_CHOICE = "multiple-choice",
    RATING = "rating",
    LINEAR_SCALE = "linear-scale",
    FILE_UPLOAD = "file-upload",
    RESPONDENT_COUNTRY = "respondent-country",
    EMBED = "embed",
    EMBED_IMAGE = "embed-image",
    EMBED_VIDEO = "embed-video",
    CONDITIONAL_LOGIC = "conditional-logic",
    HIDDEN_FIELDS = "hidden-fields",
    CALCULATED_FIELDS = "calculated-fields",
    TABLE = "table",
    FORM = "form",
    SECTION = "section",
    GROUP = "group",
    COLUMN = "column",
    ROW = "row",
    GRID = "grid",
    LIST = "list",
    CARDS = "cards",
    CARDS_LIST = "cards-list",
    CARDS_GRID = "cards-grid",
    CARDS_TABLE = "cards-table",
    CARDS_FORM = "cards-form",
    CARDS_SECTION = "cards-section",
    CARDS_GROUP = "cards-group",
    CARDS_COLUMN = "cards-column"
}
export default Form;
//# sourceMappingURL=form.dto.d.ts.map