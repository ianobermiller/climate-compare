import {useEffect, useState} from 'react';

export default function useLocalStorage(name, defaultValue) {
  function getInitialValue() {
    const textValue = localStorage.getItem(name);
    return textValue ? JSON.parse(textValue) : defaultValue;
  }

  const [value, setValueInState] = useState(getInitialValue);
  useEffect(() => {
    const serialized = JSON.stringify(value);
    if (serialized == null) {
      return;
    }

    localStorage.setItem(name, serialized);
  }, [name, value]);

  return [value, setValueInState];
}
