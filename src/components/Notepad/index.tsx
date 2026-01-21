import { Button, Modal, Tooltip } from 'antd'
import { useState, ChangeEvent, FC, useEffect, useRef } from 'react'
import "./index.css"

interface INotepadProps {
  handleClose: () => void
  handleSubmit: (content: string) => void
}

const Notepad: FC<INotepadProps> = ({
  handleClose,
  handleSubmit
}) => {
  const [value, setValue] = useState('')
  const [error, seterror] = useState('')
  const wrapperRef = useRef<any>(null)
  const [isWarningOpen, setisWarningOpen] = useState(false)

  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [wrapperRef, value])

  function handleClickOutside(event: any) {
    if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
      if (value) {
        setisWarningOpen(true)
      } else {
        handleClose()
      }
    }
  }

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(event.target.value)
    if (error) {
      seterror('')
    }
  }

  const handleBlur = () => {
    if (!value.trim()) {
      seterror("The field is mandatory.")
    }
  }

  const handleSubmitWithValidation = () => {
    if (!value.trim()) {
      seterror("The field is mandatory.")
    } else {
      handleSubmit(value)
    }
  }

  const handleWarningClose = () => {
    setisWarningOpen(false)
  }

  return (
    <>
      <div className="notepad" ref={wrapperRef}>
        <div className="notepad-top">
          <h4>Note</h4>
          <Tooltip placement="top" title="Close">
            <img
              src="./assets/close_btn.svg"
              alt="close"
              className="cursor-pointer"
              onClick={handleClose}
            />
          </Tooltip>
        </div>
        <div className='notepad-textarea'>
          <textarea
            autoFocus
            cols={30}
            rows={10}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
          ></textarea>
          {
            error &&
            <p className="error">{error}</p>
          }
        </div>
        <button onClick={() => handleSubmitWithValidation()}>Submit</button>
      </div>
      <Modal
        title={<h2 className='text-center text-white font-bold text-lg'>Sure want to close note without saving it?</h2>}
        open={isWarningOpen}
        centered={true}
        footer={null}
        onCancel={handleWarningClose}
      >
        <p className="text-center py-3">Changes that you made may not be saved.</p>
        <div className="flex justify-end w-full pr-6 py-3">
          <Button style={{ background: '#fff', color: '#000', border: '1px solid #000', marginRight: "1rem" }} onClick={handleWarningClose}>Cancel</Button>
          <Button style={{ background: '#137AD2', color: '#fff' }} onClick={handleClose}>Close</Button>
        </div>
      </Modal>
    </>
  )
}

export default Notepad