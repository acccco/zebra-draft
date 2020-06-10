import Component, { rawType, operatorType, classType } from "./component";
import PlainText from "./plain-text";
import ContentCollection from "./content-collection";
import ComponentType from "../const/component-type";
import { getContentBuilder } from "../builder";

class Code extends PlainText {
  type = ComponentType.code;

  static create(raw: rawType): Code {
    return new Code(raw.content, raw.style, raw.data);
  }

  static exchangeOnly(component: Component, args: any[] = []): Code[] {
    let code = new Code();
    if (component instanceof ContentCollection) {
      code.add(component.children.map((item) => item.content).join(""), 0);
    }
    return [code];
  }

  getRaw(): rawType {
    let raw: rawType = {
      type: this.type,
      content: this.content
    };
    if (!this.decorate.styleIsEmpty()) {
      raw.style = this.decorate.getStyle();
    }
    if (!this.decorate.dataIsEmpty()) {
      raw.data = this.decorate.getData();
    }
    return raw;
  }

  render() {
    const builder = getContentBuilder();
    return builder.buildCode(
      this.id,
      this.content,
      this.decorate.getStyle(),
      this.decorate.getData()
    );
  }
}

export default Code;
