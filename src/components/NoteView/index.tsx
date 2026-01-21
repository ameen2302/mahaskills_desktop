import { Button, Modal, Tooltip } from 'antd';
import { FC, useEffect, useRef, useState } from 'react'
import { NotesData } from '../../definitions/general';
import { IndexedDBService } from '../../store/courses/indexedDBService';
import "./index.css";
interface INoteViewProps {
  content: NotesData
  handleClose: () => void
  handleInitialNoteFromDB: () => Promise<unknown>
}

const NoteView: FC<INoteViewProps> = ({
  content,
  handleClose,
  handleInitialNoteFromDB
}) => {
  const wrapperRef = useRef<any>(null)
  const indexedDBService = new IndexedDBService();
  const [isDeleteOpen, setisDeleteOpen] = useState(false)
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event: any) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target) && !isDeleteOpen) {
        handleClose()
      }
    }
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [wrapperRef, isDeleteOpen])

  const handleNoteDelete = () => {
    indexedDBService.deleteNoteById(content.id).then(() => {
      const noteImageEle = document.querySelectorAll('.note-image-container');
      noteImageEle.forEach(note => {
        note.remove();
      });
      handleInitialNoteFromDB().then(() => {
        handleClose()
      })
    })
  }

  const handleNoteDeleteConfimationOpen = () => {
    setisDeleteOpen(true)
  }

  const handleNoteDeleteConfimationClose = () => {
    setisDeleteOpen(false)
  }

  return (
    <div className='noteview-container' ref={wrapperRef}>
      <div className="notepad-top">
        <h4>Note</h4>
        <div className="flex items-center justify-center">
          <Tooltip placement="top" title="Delete Note">
            <img
              src="./assets/delete.svg"
              alt="delete note"
              className="cursor-pointer mr-4"
              onClick={handleNoteDeleteConfimationOpen}
            />
          </Tooltip>
          <Tooltip placement="top" title="Close">
            <img
              src="./assets/close_btn.svg"
              alt="close"
              className="cursor-pointer"
              onClick={handleClose}
            />
          </Tooltip>
        </div>
      </div>
      <p className='max-h-72 overflow-auto'>
        {content?.content || ''}
      </p>
      <Modal
        // title={<h2 className='text-center text-white font-bold text-lg'>Sure want to close note without saving it?</h2>}
        open={isDeleteOpen}
        centered={true}
        footer={null}
        onCancel={handleNoteDeleteConfimationClose}
        closable={false}
      >
        <p className="text-center py-3 text-lg pt-6">Sure want to delete this note?</p>
        <div className="flex justify-end w-full pr-6 py-3">
          <Button style={{ background: '#fff', color: '#000', border: '1px solid #000', marginRight: "1rem" }} onClick={handleNoteDeleteConfimationClose}>Cancel</Button>
          <Button style={{ background: '#137AD2', color: '#fff' }} onClick={() => {
            handleNoteDelete()
          }}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}

export default NoteView