function getCursorPosition(id) {
  const input = document.getElementById(id);
  const cursorPosition = input.selectionStart;
  return cursorPosition;
}

function setCursorPosition(id, cursorPosition) {
  const input = document.getElementById(id);
  input.focus();
  input.setSelectionRange(cursorPosition, cursorPosition);
}

const ReactDOM = (function () {
  let _container;
  let _Component;

  return {
    update() {
      this.render(_container, _Component);
    },
    render(container, Component) {
      _container = container;
      _Component = Component;

      const componentDOM = React.render(Component);
      container.replaceChildren();
      container.appendChild(componentDOM);
    },
  };
})();

const React = (function () {
  let hooks = [];
  let currentIndex = 0;

  return {
    render(Component) {
      currentIndex = 0;

      const Comp = Component();
      return Comp;
    },
    useState(initialValue) {
      const useStateIndex = currentIndex;
      currentIndex++;

      hooks[useStateIndex] = hooks[useStateIndex] ?? initialValue;

      const setState = (newVal) => {
        const newState =
          typeof newVal === "function" ? newVal(hooks[useStateIndex]) : newVal;
        hooks[useStateIndex] = newState;
        ReactDOM.update();
      };

      return [hooks[useStateIndex], setState];
    },
    useReducer(reducer, initialState) {
      const useReducerIndex = currentIndex;
      currentIndex++;

      hooks[useReducerIndex] = hooks[useReducerIndex] ?? initialState;

      const dispatch = (action) => {
        const newState = reducer(hooks[useReducerIndex], action);
        hooks[useReducerIndex] = newState;
        ReactDOM.update();
      };

      return [hooks[useReducerIndex], dispatch];
    },
    useEffect(callback, depArray) {
      const hasNoDeps = !depArray;
      const deps = hooks[currentIndex];
      const hasChangedDeps = deps
        ? !depArray.every((el, i) => el === deps[i])
        : true;
      if (hasNoDeps || hasChangedDeps) {
        hooks[currentIndex] = depArray;
        callback();
      }
      currentIndex++;
    },
  };
})();

function counterReducer(prevState, action) {
  switch (action.type) {
    case "increase": {
      return {
        count: prevState.count + 1,
      };
    }
    case "decrease": {
      return {
        count: prevState.count - 1,
      };
    }
    default: {
      return prevState;
    }
  }
}

function Counter() {
  const [state, dispatch] = React.useReducer(
    counterReducer,
    localStorage.getItem("state")
      ? JSON.parse(localStorage.getItem("state"))
      : { count: 0 }
  );

  React.useEffect(() => {
    localStorage.setItem("state", JSON.stringify(state));
  }, [state]);

  const textDisplay = document.createElement("p");
  textDisplay.textContent = state.count;

  const buttonIncrease = document.createElement("button");
  buttonIncrease.textContent = "+";
  buttonIncrease.onclick = () => dispatch({ type: "increase" });

  const buttonDecrease = document.createElement("button");
  buttonDecrease.textContent = "-";
  buttonDecrease.onclick = () => dispatch({ type: "decrease" });

  const container = document.createElement("div");
  container.appendChild(textDisplay);
  container.appendChild(buttonIncrease);
  container.appendChild(buttonDecrease);

  return container;
}

function Input() {
  const [inputValue, setInputValue] = React.useState(
    localStorage.getItem("inputValue") ?? ""
  );

  React.useEffect(() => {
    localStorage.setItem("inputValue", inputValue);
  }, [inputValue]);

  function handleChange(event) {
    const cursorPosition = getCursorPosition("input");
    setInputValue(event.target.value);
    setCursorPosition("input", cursorPosition);
  }

  const input = document.createElement("input");
  input.id = "input";
  input.value = inputValue;
  input.oninput = handleChange;

  const display = document.createElement("p");
  display.textContent = inputValue;

  const container = document.createElement("div");
  container.appendChild(input);
  container.appendChild(display);

  return container;
}

function App() {
  const counter = Counter();
  const input = Input();

  const appContainer = document.createElement("div");
  appContainer.appendChild(counter);
  appContainer.appendChild(input);

  return appContainer;
}

const root = document.getElementById("root");
ReactDOM.render(root, App);
