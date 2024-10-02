import { Attributes, createElement, useEffect, useState } from "react";
import { createRoot, Root } from "react-dom/client";
import {
  getPropsFromAStringComponent,
  parseValue,
  camelCasetoKebabCase,
  log,
  kebabCaseToCamelCase,
} from "./defineCustomElementReact.pure";

interface EventWithDetail extends Event {
  detail: { value: string };
}

const WrapperComponent = ({
  componentToRender,
  propNames,
  componentName,
  refToCustomElements,
  initialPropValue,
}: {
  componentToRender: React.FC;
  propNames: string[];
  componentName: string;
  refToCustomElements: HTMLElement;
  initialPropValue: Attributes;
  initialEventsMissed?: CustomEvent[];
}) => {
  const [propsOfWrappedFC, setPropsOfWrappedFC] = useState<Attributes>(initialPropValue);
  useEffect(() => {
    const events = propNames.map((propName) => {
      const cb = (event: any) => {
        setPropsOfWrappedFC((prevProps) => ({
          ...prevProps,
          [kebabCaseToCamelCase(propName)]: parseValue((event as EventWithDetail).detail.value),
        }));
      };
      refToCustomElements.addEventListener(`${componentName}-${propName}`, cb);
      return { propName, cb };
    });
    refToCustomElements.dispatchEvent(new CustomEvent(`${componentName}-loaded`));
    return () => {
      events.forEach(({ propName, cb }) => {
        refToCustomElements.removeEventListener(`${componentName}-${propName}`, cb);
      });
    };
  }, [componentName, propNames, refToCustomElements]);
  return <>{createElement(componentToRender, propsOfWrappedFC)}</>;
};

type defineCustomElementReactType = {
  namespace: string;
  component: React.FC;
  name?: string;
  props?: string[];
};

export const defineCustomElementReact = ({ namespace, component, name, props }: defineCustomElementReactType): void => {
  const componentName = name || camelCasetoKebabCase(component.displayName || component.name);

  if (customElements.get(`${namespace}-${componentName}`)) {
    return;
  }

  const camelCaseProps = props || getPropsFromAStringComponent(component);
  const kebabCaseProps = camelCaseProps.map((cp) => camelCasetoKebabCase(cp));

  class ReactWrapperCustomElements extends HTMLElement {
    static observedAttributes = kebabCaseProps;
    private root: Root;
    private props: Attributes = {};
    private isRendered = false;
    private eventQueue: CustomEvent[] = [];

    cbComponentLoaded() {
      this.isRendered = true;
      while (this.eventQueue.length > 0) {
        this.dispatchEvent(this.eventQueue.shift()!);
      }
    }

    constructor() {
      super();
      this.addEventListener(`${componentName}-loaded`, this.cbComponentLoaded);
      log(`Custom element "${componentName}" added to page.`);
      this.root = createRoot(this);
    }

    render() {
      this.root.render(
        <WrapperComponent
          componentToRender={component}
          componentName={componentName}
          propNames={kebabCaseProps}
          refToCustomElements={this}
          initialPropValue={this.props}
        ></WrapperComponent>
      );
    }

    disconnectedCallback() {
      log(`Custom element "${componentName}" removed from page.`);
      this.removeEventListener(`${componentName}-loaded`, this.cbComponentLoaded);
      this.root.unmount();
    }

    connectedCallback() {
      this.render();
    }

    attributeChangedCallback(propName: string, oldValue: string, newValue: string) {
      log(`Attribute ${propName} has changed. ${oldValue} => ${newValue}`);

      this.props = {
        ...kebabCaseProps,
        [propName]: newValue,
      } as unknown as Attributes;

      if (typeof newValue !== "string" || !(newValue.includes("{{") && newValue.includes("}}"))) {
        const event = new CustomEvent<{ value: string }>(`${componentName}-${propName}`, {
          detail: { value: newValue },
        });

        if (this.isRendered) {
          this.dispatchEvent(event);
        } else {
          this.eventQueue.push(event);
        }
      }

      this.render();
    }
  }

  kebabCaseProps.forEach((prop) => {
    Object.defineProperty(ReactWrapperCustomElements.prototype, prop, {
      get() {
        return this.props[prop];
      },
      set(newVal: unknown) {
        this.attributeChangedCallback(prop, this.props[prop], newVal);
      },
    });
  });

  customElements.define(`${namespace}-${componentName}`, ReactWrapperCustomElements);
};
