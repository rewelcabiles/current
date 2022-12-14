import { useEffect, useState } from "react"
import { db, updateNote } from "services/firebase"
import parse from 'html-react-parser';
import Showdown from "showdown";
import { useNavigate, useParams } from "react-router-dom";
import { Spinner } from "flowbite-react";
import { off, onValue, ref } from "firebase/database";
import {useDispatch, useSelector} from "react-redux";
import {setNote} from "../../stores/Notes/notesSlice";

export default function EditorNote() {
    let navigate = useNavigate();
    const converter = new Showdown.Converter()
    const { user_id, post_id } = useParams();
    const currentNote = useSelector((state) => state.notes.currentNote)
    const [showPreview, setShowPreview] = useState(true)
    const dispatch = useDispatch();
    const updateBody = function(event) {
        let tempNote = { ...currentNote, body: event.target.value }
        updateNote(tempNote, user_id)
    }

    const handleTab = e => {
        if (e.key === 'Tab') {
            const target = e.target
            e.preventDefault();

            let end = target.selectionEnd;
            let start = target.selectionStart;

            target.value = target.value.substring(0, start) + "\t\t\t\t\t" + target.value.substring(end);
            target.selectionStart = target.selectionEnd = start + 1;
        }
    }

    const [loadingNote, setLoadingNote] = useState(true);

    useEffect( () => {
        const notesRef = ref(db, `/notes/users/${user_id}/notes/${post_id}`);
        setLoadingNote(true);
        onValue(notesRef, (snapshot) => {
            const data = snapshot.val();
            if (!data) {
                navigate("/edit/error");
            }
            setLoadingNote(false);

            dispatch(setNote({...data}));
            if( data ) {
                document.title = data.title + " - Currently Notes";
            } else {
                document.title = "Currently Notes";
            }
        }, () => {
            navigate("/edit/error");
        });
        return () => {
            off(notesRef)
        }
    }, [post_id, user_id, navigate, dispatch]);

    if ( loadingNote ) {
        return (
            <div className={`mx-auto pt-28`}>
                <Spinner aria-label="Loading Note" size="xl" />
            </div>
        )
    }

    return (
        <div className={`flex lg:flex-row p-5 py-10 flex-col transition-all h-full overflow-hidden w-full`}>
            <div className={`flex flex-col w-full px-4 lg:h-full h-1/2 resize-y  ${showPreview ? 'lg:w-1/2 w-full' : 'lg:mx-auto lg:w-2/3'}`}>
                <div className="font-light px-4">
                    <div className={"flex flex-row"}>
                        <div className="">
                            <button onClick={() => setShowPreview((prevState) => {return !prevState })} className="text-zinc-700 hover:text-zinc-600">
                                Toggle Preview
                            </button>
                        </div>
                    </div>
                    <hr />
                </div>

                <textarea
                    onKeyDown={ handleTab }
                    className="h-full border-none outline-none focus:ring-0 overflow-auto px-4 scrollbar_thin"
                    value={ currentNote.body }
                    onChange={ updateBody }
                    placeholder="Insert Text Here"
                />
            </div>
            {
                showPreview === true
                    ?
                    <div className={`transition-all flex flex-col lg:w-1/2 lg:h-full h-1/2`}>
                        <div className={`font-light w-full px-2`}>
                            Preview
                            <hr />
                        </div>

                        <div className={`h-full overflow-y-auto scrollbar_thin px-2`}>
                            <div className="text-xl">
                                { currentNote.title }
                            </div>
                            <div className={`is_markdown`} >
                                {
                                    parse(converter.makeHtml(currentNote.body))
                                }
                            </div>
                        </div>
                    </div>
                : ""
            }
        </div>
    )
}
