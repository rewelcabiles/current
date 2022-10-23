import SidePanel from "./SidePanel/SidePanel";
import Editor from "./Editor/Editor";
import Statusbar from "./Statusbar/Statusbar";
import React, { useState, useEffect, createContext } from 'react';
import { getDatabase, ref, onValue } from "firebase/database";
import { app } from "../services/firebase";
import { getAuth } from "firebase/auth";



// Context
export const AppContext = createContext()

function Home() {
  const [currentNote, setCurrentNote] = useState(null);
  const [noteList, setNoteState] = useState({});
  const [user, setUserState] = useState(null);
  const [editState, setEditState] = useState(false);
  const [extended, setExtendedState] = useState(true)

  const context = {
    user: user,
    noteList: noteList,
    currentNote: currentNote,
    editState: editState,
    extended: extended,
    setExtendedState: setExtendedState,
    setEditState: setEditState,
    setUserState: setUserState,
    setCurrentNote: setCurrentNote
  }

  useEffect(() => {
    getAuth().onAuthStateChanged(function(user) {
      if( user ) {
        setUserState(user);
        const db = getDatabase(app);
        const notesRef = ref(db, `/notes/users/${user.uid}/notes`);
        onValue(notesRef, (snapshot) => {
          const data = snapshot.val();
          if( !data ){
            setNoteState([])
          } else {
            setNoteState(data);
          }
        });
      } else {
        setUserState(null);
      }
    });
    
  }, []);

  return (
    <AppContext.Provider value={context}>
      <div className="flex flex-col w-screen h-screen">
        <Statusbar/>
        <div className="w-full grow flex flex-row">
          <SidePanel />
          {
            currentNote === null
            ? <div className="lg:px-20 px-5 py-10 w-full h-full lg:py-4 text-zinc-500 text-center"> 
              {
                context.user
                ? 'Select a note on the left, or create a new one!'
                : 'Login now to get started!'
              }
            
             </div>
            : <Editor note={ noteList[currentNote] } />
          }
        </div>
      </div>
    </AppContext.Provider>
  );
}

export default Home;