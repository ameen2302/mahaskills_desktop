import React, { FC } from 'react'
import "../ZoomPopOver/index.css"

interface IBookmarkPopoverProps {
  handleBookmarkView: () => void
  handleBookmarkAdd: () => void
} 

export const BookmarkPopover:FC<IBookmarkPopoverProps> = ({
  handleBookmarkView,
  handleBookmarkAdd
}) => {
  return (
    <div className='zoom-popover'>
      <button className="mr-1" onClick={handleBookmarkAdd}>
        <img src="./assets/bookmark_add.svg" alt='Zoom In' className="mb-1" />
        <span>Add</span>
      </button>
      <button onClick={handleBookmarkView}>
        <img src="./assets/bookmark_view.svg" alt='Zoom Out' className="mb-1" />
        <span>View</span>
      </button>
    </div>
  )
}
