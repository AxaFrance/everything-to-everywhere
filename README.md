# EverythingToEverywhere

## Besoin

Ce package permet d'utiliser des composants React dans n'importe quel environnement qu'importe le framework ou la stack utilisé grâce à la technologie des customs elements. 

## Utilisation

### Composant React à utiliser

Pour le moment, cette méthode ne fonctionne qu'avec les arrow function components.

Voici un exemple de composant très simple avec le support de props de différent types en entrée (avec valeur par défaut possible).

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


### Rendre utilisable le composant React
Afin de rendre le composant React précédemment créé utilisable n'importe où sous la forme d'un custom element, il faut définir ce custom element. 

La méthode `defineCustomElementReact` vous permet justement de proposer plusieurs éléments essentiels : 
#### namespace
type : *string*

Un custom element doit être préfixé d'un namespace afin d'éviter tout conflit avec des balises ou directives existantes.

#### component
type : *React.FC*

Il est nécessaire dans cette propriété de passer un composant sous la forme d'une arrow function component.

#### name
type : *string* optionnal

Le nom du custom element peut être inféré depuis le nom du composant passé dans la propriété `component` ou son `displayName`.
Vous pouvez évidemment le personnaliser grâce à cette propriété.

#### props
type : *string[]* optionnal (requis si le composant react n'est pas sous la forme d'une arrow function)

Cette propriété sert à indiquer la liste des props que vous voulez que le custom element écoutent. A chaque fois qu'une des valeurs changera, le custom element sera rerender.


```js
import { defineCustomElementReact } from '@axa-fr/everything-to-everywhere';
import AnyReactComponent from './AnyReactComponent';

defineCustomElementReact({
  namespace: 'owc',
  component: AnyReactComponent,
  name: "a-component",
  props: ["prop", "you", "want", "to", "listen"]
})
```

Cependant, dans un cas très simple, vous pouvez omettre le nom du composant et la liste des propriétés. Cela fonctionne seulement : 
- si vous souhaitez mapper toutes les props 
- que votre composant les destructures toutes de facon explicites. Par exemple `({prop1, prop2, prop3})` fonctionnerait mais pas `({prop1, ...props})` ou `(props)`
- que votre composant soit sous la forme d'une arrow function component
- la target du bundle soit > ES6
- pas de déplacement sur la destructuration des props au bundle

Vous pouvez dans tous les cas passer des valeurs par défaut.

```js
import { defineCustomElementReact } from '@axa-fr/everything-to-everywhere';
import AnyReactComponent from './AnyReactComponent';

defineCustomElementReact({
  namespace: 'owc',
  component: AnyReactComponent
})
```

### Utiliser le nouveau custom element

Dans notre premier exemple, le composant React s'appelait `AnyReactComponent` (en pascal case).
Le custom element doit répondre aux normes de l'HTML et aux bonnes pratiques en vigueur, donc avec un namespace et en pascal case.

Notre composant sera donc utilisable sous le nom `owc-any-react-component`.

#### Passer des données

Il faudra également lui passer tous ses attributs obligatoires : 

```html
<owc-any-react-component
  mode="{{$ctrl.config.legacyContractBanner.bannerContent2}}"
  children="{{$ctrl.replacementCompareUrl}}"
  array="{{$ctrl.arrayForCE}}"
  object="{{$ctrl.objectForCE}}"
  number="12">
</owc-any-react-component>
```

Ici `type` n'est pas passé car il avait une valeur par défaut dans sa déclaration précédente.

Ce custom element est disponible partout où vous pouvez écrire du HTML, que ce soit dans une directive AngularJS, du JSX, etc.

#### Gérer les événements

Les événements sont à gérer sous la forme d'un callback que l'on viendra ajouter après la définition du custom element.

Reprenons notre exemple précédent en l'épurant un peu.

```javascript
const AnyReactComponent = ({ type = "default value", mode, children, array = [], object, number, onUpdate }) => <>
  ...
  <input type="text" onChange={onUpdate} />
</>
```

Pour rappel, dans notre cas, notre composant sera utilisé avec la balise `owc-any-react-component`. 

Nous allons venir attacher nos événéments sous cette forme : 

```js
const $OwcAnyReactComponent = document.querySelector("owc-any-react-component");
$OwcAnyReactComponent.onUpdate = event => {
    console.log("### onUpdate", event.target.value);
};
```

La gestion de l'event se fait donc en plusieurs étapes : 
1. Passer notre événement `onUpdate` en prop du composant React
2. Appeler cette méthode au moment voulu (par exemple ici en callback de notre événément `onChange` de notre input) dans le composant React
3. Récupérer notre custom element où l'on souhaite gérer l'événement
4. Accrocher un nouvel attribut à notre custom element récemment récupéré (même nom que la prop passée dans le composant React, récupération possible des paramètre passé lorsque cette méthode a été appelé en React)