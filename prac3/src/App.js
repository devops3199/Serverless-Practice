import React, { useEffect, useReducer } from "react";
import { API } from "aws-amplify";
import { listNotes } from "./graphql/queries";

const initialState = {
  notes: [],
  loading: true,
  error: false,
  form: { name: "", description: "" },
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_NOTES":
      return { ...state, notes: action.notes, loading: false };
    case "ERROR":
      return { ...state, loading: false, error: true };
    default:
      return state;
  }
};

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleFetch = async () => {
    try {
      const notesData = await API.graphql({
        query: listNotes,
      });
      dispatch({ type: "SET_NOTES", notes: notesData.data.listNotes.items });
    } catch (err) {
      console.error("error: ", err);
      dispatch({ type: "ERROR" });
    }
  };

  useEffect(() => {
    handleFetch();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      {state.notes.map((note) => (
        <div>
          <h3>{note.name}</h3>
          <p>{note.description}</p>
        </div>
      ))}
    </div>
  );
}

export default App;
