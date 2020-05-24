import Component from "../components/component";

// 更新组件
const updateComponent = (component: Component | Component[]) => {
  if (Array.isArray(component)) {
    component.forEach((item) => update(item));
  } else {
    update(component);
  }
};

const update = (component: Component) => {
  let dom = document.getElementById(component.id);
  if (dom) {
    if (component.actived) {
      dom.parentElement?.replaceChild(component.render(), dom);
    } else {
      dom.remove();
    }
  } else {
    let parentComponent = component.parent;
    if (!parentComponent) return;
    let parentDom = document.getElementById(parentComponent?.id);
    let index = parentComponent.children.findIndex(
      (child) => child === component
    );
    if (index === parentComponent.children.size - 1) {
      parentDom?.appendChild(component.render());
    } else {
      let afterComId = parentComponent.children.get(index + 1)?.id;
      if (afterComId) {
        parentDom?.insertBefore(
          component.render(),
          document.getElementById(afterComId)
        );
      }
    }
  }
};

export default updateComponent;
