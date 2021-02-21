import ComponentFactory from "../components";
import Article from "../components/article";
import Block from "../components/block";
import StructureCollection from "../components/structure-collection";
import ContentBuilder from "../content/content-builder";
import UserOperator from "../operator-user";
import { createError } from "../util/handle-error";
import HistoryManage from "./manage/history-manage";
import StoreManage from "./manage/store-manage";
import createEditor from "./util/create-editor";

export interface EditorOption {
  placeholder?: string;
  userOperator: typeof UserOperator;
  contentBuilder: typeof ContentBuilder;
  componentFactory: typeof ComponentFactory;
  onError?: (error: Error) => void;
  beforeCreate?: (document: Document, window: Window | null) => void;
  afterCreate?: (document: Document, window: Window | null) => void;
}

class Editor {
  mountedElement: HTMLElement;
  article!: Article;
  placeholder: string;

  mountedWindow!: Window;
  mountedDocument!: Document;

  historyManage: HistoryManage;
  storeManage: StoreManage;

  userOperator: UserOperator;
  componentFactory: ComponentFactory;
  contentBuilder: ContentBuilder;

  constructor(
    idOrElement: string | HTMLElement,
    article: Article,
    option: EditorOption,
  ) {
    if (typeof idOrElement === "string") {
      let dom = document.getElementById(idOrElement);
      if (!dom) {
        throw createError("请传入正确的节点或节点 id", undefined, "create");
      }
      this.mountedElement = dom;
    } else {
      this.mountedElement = idOrElement;
    }

    article.editor = this;
    this.article = article;
    this.placeholder = option.placeholder || "";

    this.userOperator = new option.userOperator(this);
    this.contentBuilder = new option.contentBuilder(this);
    this.componentFactory = new option.componentFactory(this);

    this.historyManage = new HistoryManage(this);
    this.storeManage = new StoreManage(this);

    this.addEditorToBlock(article);

    createEditor(
      this.mountedElement,
      this.article,
      this,
      (document: Document, window: Window) => {
        this.mountedDocument = document;
        this.mountedWindow = window;
        option.beforeCreate?.(document, window);
      },
      option.afterCreate,
    );
  }

  init(article: Article) {
    this.article = article;
    this.historyManage.init();
    this.storeManage.init();
  }

  addEditorToBlock(block: Block) {
    block.editor = this;
    if (block instanceof StructureCollection) {
      block.children.forEach((item) => this.addEditorToBlock(item));
    }
  }
}

export default Editor;