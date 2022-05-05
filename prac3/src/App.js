import React, { useEffect, useReducer } from "react";
import { v4 as uuid } from "uuid";
import { API } from "aws-amplify";
import { listNotes } from "./graphql/queries";
import { createNote } from "./graphql/mutations";

const CLIENT_ID = uuid();

const initialState = {
  notes: [],
  loading: true,
  error: false,
  form: { name: "", description: "" },
};

const reducer = (state, action) => {
  switch (action.type) {
    case "ADD_NOTE":
      return { ...state, notes: [...state.notes, action.note] };
    case "RESET_FORM":
      return { ...state, form: initialState.form };
    case "SET_INPUT":
      return { ...state, form: { ...state.form, [action.name]: action.value } };
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

  useEffect(() => {
    async function init() {
      try {
        const notesData = await API.graphql({
          query: listNotes,
        });
        dispatch({ type: "SET_NOTES", notes: notesData.data.listNotes.items });
      } catch (err) {
        console.error("error: ", err);
        dispatch({ type: "ERROR" });
      }
    }

    init();
  }, []);

  const handleNoteCreate = async () => {
    const { form } = state;

    if (!form.name || !form.description) {
      return alert("Please enter a name and description");
    }

    const note = { ...form, clientId: CLIENT_ID, completed: false, id: uuid() };
    dispatch({ type: "ADD_NOTE", note });
    dispatch({ type: "RESET_FORM" });

    try {
      await API.graphql({
        query: createNote,
        variables: { input: note },
      });
      console.log("Successfully created note!");
    } catch (err) {
      console.error("error: ", err);
    }
  };

  return (
    <div>
      <div>
        <input
          type="text"
          placeholder="Note Name"
          name="name"
          value={state.form.name}
          onChange={(e) =>
            dispatch({
              type: "SET_INPUT",
              name: e.target.name,
              value: e.target.value,
            })
          }
        />
        <input
          type="text"
          placeholder="Note Description"
          name="description"
          value={state.form.description}
          onChange={(e) =>
            dispatch({
              type: "SET_INPUT",
              name: e.target.name,
              value: e.target.value,
            })
          }
        />
        <button onClick={handleNoteCreate}>Create Note</button>
      </div>
      <div style={{ padding: 20 }}>
        {state.notes.map((note) => (
          <div>
            <h3>{note.name}</h3>
            <p>{note.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
