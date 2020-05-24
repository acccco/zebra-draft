import Collection from "./collection";
import ComponentType from "../const/component-type";
import Media from "./media";
import Paragraph from "./paragraph";
import { getContentBuilder } from "../builder/index";

export default class Article extends Collection<Paragraph | Media> {
  type = ComponentType.article;
  render() {
    console.log("test getContent couter");
    let children = this.children
      .map((component) => component.render())
      .toArray();
    return getContentBuilder().buildArticle(
      this.id,
      children,
      this.decorate.getStyle(),
      this.decorate.getData()
    );
  }
}
