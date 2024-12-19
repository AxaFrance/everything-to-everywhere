# EverythingToEverywhere

## Need

This package allows you to use React components in any environment, regardless of the framework or stack used, thanks to the technology of custom elements.

In the future, it will also allow the use of components developed with other libraries or frameworks.

## Usage

### Example for React Component that you can use

Currently, this method only works with arrow function components.

Here is a very simple component example that supports props of different types as input (with possible default values).

```jsx
import React from "react";

const AnyReactComponent = ({ type = "default value", mode, children, array = [], object, number, onUpdate }) => <>
  <h2>AnyReactComponent</h2>
  <p><strong>type : </strong> {type}</p>
  <p><strong>mode : </strong> {mode}</p>
  <p><strong>children : </strong> {children}</p>
  <p><strong>array : </strong></p>
  <ul>{array.map(item => (    
    <li key={item}>{item}</li>
  ))}</ul>
  <p><strong>object : </strong>{object?.sub?.sub1}</p>
  <p><strong>number : </strong>{number}</p>
  <input type="text" onChange={onUpdate} />
</>

AnyReactComponent.displayName = "AnyReactComponent";

export default AnyReactComponent;
```

### Making the React Component usable everywhere
To make the previously created React component usable anywhere as a custom element, you need to define this custom element.

The method `defineCustomElementReact` allows you to specify several essential elements: 
#### namespace
type: *string*

It's highly recommended to prefix the custom element by a namespace to avoid conflicts with existing tags or directives.

#### component
type: *React.FC*

It's necessary to provide an arrow function component in this property.

#### name
type: *string* optional

The name of the custom element can be inferred from the name of the component passed in the `component` property or its `displayName`. You can, of course, customize it using this property.

#### props
type: *string[]* optional (required if the React component is not an arrow function)

This property indicates the list of props that you want to listen. Whenever one of the values changes, the custom element will re-render.

```js
import { defineCustomElementReact } from '@axa-fr/everything-to-everywhere';
import AnyReactComponent from './AnyReactComponent';

defineCustomElementReact({
  namespace: 'owc',
  component: AnyReactComponent,
  name: "a-component",
  props: ["prop", "you", "want", "to", "listen"]
})
```

However, in a very simple case, you can omit the component name and the list of properties. This only works if: 
- you want to map all the props 
- your component destructures all of them explicitly. For example `({prop1, prop2, prop3})` would work but not `({prop1, ...props})` or `(props)`
- your component is in the form of an arrow function component
- the target of the bundle is > ES6
- there is no modification on the destructuring of props in the bundle

You can, in all cases, set default values.

```js
import { defineCustomElementReact } from '@axa-fr/everything-to-everywhere';
import AnyReactComponent from './AnyReactComponent';

defineCustomElementReact({
  namespace: 'owc',
  component: AnyReactComponent
})
```

### Using the new custom element

In our previous example, the React component was called `AnyReactComponent` (in Pascal case). 
The custom element must comply with HTML standards and best practices, so it should have a namespace and be in kebab case.

Our component will be usable with the name `owc-any-react-component`.

#### Passing Data

You will also need to pass all its required attributes: 

```html
<owc-any-react-component
  mode="{{$ctrl.config.legacyContractBanner.bannerContent2}}"
  children="{{$ctrl.replacementCompareUrl}}"
  array="{{$ctrl.arrayForCE}}"
  object="{{$ctrl.objectForCE}}"
  number="12">
</owc-any-react-component>
```

Here, `type` is not provided because it had a default value in its previous declaration.

This custom element is available wherever you can write HTML, whether in an AngularJS directive, JSX, etc.

#### Handling Events

Events are managed with callbacks that can be add after defining the custom element.

Let’s take our previous example and simplify it a little bit.

```js
const AnyReactComponent = ({ type = "default value", mode, children, array = [], object, number, onUpdate }) => <>
  ...
  <input type="text" onChange={onUpdate} />
</>
```

As a reminder, in our case, our component will be used with the tag `owc-any-react-component`. 

We will add our events by this way: 

```js
const $OwcAnyReactComponent = document.querySelector("owc-any-react-component");
$OwcAnyReactComponent.onUpdate = event => {
    console.log("### onUpdate", event.target.value);
};
```

Event management occurs in several steps: 
1. Pass our `onUpdate` event as a prop of the React component
2. Call this method at the appropriate time (for example, as a callback for our `onChange` event of our input) in the React component
3. Retrieve our custom element where we want to manage the event
4. Attach a new attribute to our recently retrieved custom element (with the same name as the prop passed in the React component, the parameters can be retrieved)

Off course, you can also manage event by the way you want, for example by dispatching custom event, that works very well too.