import ComponentFactory from ".";
import { operatorType, IRawType } from "./component";
import { ICollectionSnapshoot } from "./collection";
import StructureCollection from "./structure-collection";
import Block from "./block";
import BaseBuilder from "../content/base-builder";
import ComponentType from "../const/component-type";
import { storeData } from "../decorate";
import nextTicket from "../util/next-ticket";

export interface IListSnapshoot extends ICollectionSnapshoot<Block> {
  tag: string;
}

class CustomerCollection extends StructureCollection<Block> {
  type: string = ComponentType.customerCollection;
  tag: string;

  static create(
    componentFactory: ComponentFactory,
    raw: IRawType,
  ): CustomerCollection {
    let children = raw.children
      ? raw.children.map((item) =>
          componentFactory.typeMap[item.type].create(item),
        )
      : [];
    let collection = componentFactory.buildCustomerCollection(raw.tag);
    collection.add(children);
    return collection;
  }

  static exchange(
    componentFactory: ComponentFactory,
    block: Block,
    args: any[] = [],
  ): Block[] {
    let parent = block.getParent();

    let prev = parent.getPrev(block);
    let index = parent.findChildrenIndex(block);
    block.removeSelf();

    // 当前一块内容为 CustomerCollection，并且 tag 一致，直接添加
    if (prev instanceof CustomerCollection && prev.tag === args[0]) {
      prev.add(block);
    } else {
      // 否则新生成一个 CustomerCollection
      let newList = componentFactory.buildCustomerCollection(args[0]);
      newList.add(block, 0);
      parent.add(newList, index);
    }
    return [block];
  }

  constructor(
    tag: string = "div",
    children: (string | Block)[] = [],
    style?: storeData,
    data?: storeData,
  ) {
    super(style, data);
    this.tag = tag;
    let block = children.map((item) => {
      if (typeof item === "string") {
        item = this.getComponentFactory().buildParagraph(item);
      }
      return item;
    });
    this.add(block, 0);
  }

  getType(): string {
    return `${this.type}>${this.tag}`;
  }

  getRaw(): IRawType {
    let raw = super.getRaw();
    raw.tag = this.tag;
    return raw;
  }

  createEmpty(): CustomerCollection {
    return this.getComponentFactory().buildCustomerCollection(
      this.tag,
      [],
      this.decorate.copyStyle(),
      this.decorate.copyData(),
    );
  }

  add(block: Block | Block[], index?: number): operatorType {
    // 连续输入空行，截断列表
    if (typeof index === "number" && index > 1) {
      let now = this.getChild(index - 1);
      if (now?.isEmpty() && !Array.isArray(block) && block.isEmpty()) {
        let focus = this.split(index, block);
        now.removeSelf();
        return focus;
      }
    }
    if (!Array.isArray(block)) block = [block];
    let newBlock = this.addChildren(block, index);
    return [[this, ...newBlock]];
  }

  removeChildren(
    indexOrComponent: Block | number,
    removeNumber: number = 1,
  ): Block[] {
    // 若子元素全部删除，将自己也删除
    if (removeNumber === this.getSize()) {
      nextTicket(() => {
        if (this.getSize() !== 0) return;
        this.removeSelf();
      });
    }
    return super.removeChildren(indexOrComponent, removeNumber);
  }

  childHeadDelete(block: Block, index: number): operatorType {
    // 不是第一项时，将其发送到前一项
    if (index !== 0) {
      let prev = this.getPrev(block);
      if (!prev) return [[this]];
      return block.sendTo(prev);
    }

    // 第一项时，直接将该列表项添加到父元素上
    let parent = this.getParent();
    index = parent.findChildrenIndex(this);
    block.removeSelf();
    return parent.add(block, index);
  }

  sendTo(block: Block): operatorType {
    return block.receive(this);
  }

  receive(block?: Block): operatorType {
    if (!block) return [[this]];

    if (block.isEmpty()) {
      block.removeSelf();
      let last = this.getChild(this.getSize() - 1);
      let lastSize = last.getSize();
      return [[last], { id: last.id, offset: lastSize }];
    }

    return this.add(block);
  }

  snapshoot(): IListSnapshoot {
    let snap = super.snapshoot() as IListSnapshoot;
    snap.tag = this.tag;
    return snap;
  }

  restore(state: IListSnapshoot) {
    this.tag = state.tag;
    super.restore(state);
  }

  render(contentBuilder: BaseBuilder, onlyDecorate: boolean = false) {
    let content = contentBuilder.buildCustomerCollection(
      this.id,
      this.tag,
      () =>
        this.children
          .map((item) => item.render(contentBuilder, onlyDecorate))
          .toArray(),
      this.decorate.getStyle(onlyDecorate),
      this.decorate.getData(onlyDecorate),
    );
    return content;
  }
}

export default CustomerCollection;
