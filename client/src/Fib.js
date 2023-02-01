import React, { useEffect, useState } from "react";

const Fib = () => {
  const [index, setIndex] = useState("");
  const [seenIndexes, setSeenIndexes] = useState([]);
  const [values, setValues] = useState({});

  async function fetchValues() {
    const response = await fetch("/api/values/current");
    const values = await response.json();
    console.log({ values })
    setValues(values);
  }

  async function fetchIndexes() {
    const response = await fetch("/api/values/all");
    const values = await response.json()
    setSeenIndexes(values);
  }

  useEffect(() => {
    fetchValues();
    fetchIndexes();
  }, [])

  async function handleSubmit(event) {
    event.preventDefault();
    await fetch("/api/values", { method: 'POST', body: JSON.stringify({ index }) });
    setIndex("");
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>Enter the index:</label>
        <input value={index} onChange={(e) => setIndex(e.target.value)} />
        <button>Submit</button>
      </form>
      <h3>Indexes I've seen</h3>
      {seenIndexes.join(", ")}
      <h3>Calculated values</h3>
      {Object.keys(values).map((key) => `For index ${key} I calculated ${values[key]}`)}
    </div>
  )
};

export default Fib;
