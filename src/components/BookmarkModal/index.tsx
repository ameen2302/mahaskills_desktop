import { Button, Modal, Tooltip } from "antd";
import React, { FC, useState } from "react";
import { useHistory } from "react-router";
import { Bookmark } from "../../definitions/general";

interface IBookmarkModalProps {
  bookmarks: Bookmark[] | undefined;
  isOpen: boolean;
  handleClose: () => void;
  handleBookmarkDelete: (id: number | undefined) => void;
}

const BookmarkModal: FC<IBookmarkModalProps> = ({
  bookmarks,
  isOpen,
  handleClose,
  handleBookmarkDelete,
}) => {
  const [isDeleteOpen, setisDeleteOpen] = useState(false);
  const [deleteBookmarkID, setdeleteBookmarkID] = useState<number | undefined>(
    undefined
  );

  const handleDeleteModalClose = () => {
    setisDeleteOpen(false);
    setdeleteBookmarkID(undefined);
  };

  const handleDeleteModalOpen = (id: number | undefined) => {
    setisDeleteOpen(true);
    setdeleteBookmarkID(id);
  };

  return (
    <div className="bookmark-modal">
      <Modal
        title={
          <h2 className="text-center text-white font-bold text-lg">
            BOOKMARKS
          </h2>
        }
        closeIcon={
          <img
            src="./assets/close_btn.svg"
            alt="close button"
            className="w-8 mt-3.5"
            onClick={handleClose}
          />
        }
        open={isOpen}
        centered={true}
        footer={null}
        bodyStyle={{
          background: "#F5F5F5",
        }}
        onCancel={handleClose}
      >
        {bookmarks?.length ? (
          bookmarks?.map((item, key) => (
            <BookmarkCard
              bookmark={item}
              key={key}
              handleBookmarkDelete={handleDeleteModalOpen}
              handleClose={handleClose}
            />
          ))
        ) : (
          <div className="flex items-center justify-center bg-white py-3 px-6 mb-1">
            <p>No bookmark found.</p>
          </div>
        )}
      </Modal>
      <Modal
        // title={<h2 className='text-center text-white font-bold text-lg'>Sure want to close note without saving it?</h2>}
        open={isDeleteOpen}
        centered={true}
        footer={null}
        onCancel={handleDeleteModalClose}
        closable={false}
      >
        <p className="text-center py-3 text-lg pt-6">
          Are you sure you want to delete this bookmark?
        </p>
        <div className="flex justify-end w-full pr-6 py-3">
          <Button
            style={{
              background: "#fff",
              color: "#000",
              border: "1px solid #000",
              marginRight: "1rem",
            }}
            onClick={handleDeleteModalClose}
          >
            Cancel
          </Button>
          <Button
            style={{ background: "#137AD2", color: "#fff" }}
            onClick={() => {
              handleBookmarkDelete(deleteBookmarkID);
              setisDeleteOpen(false);
            }}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default BookmarkModal;

interface IBookmarkCardProps {
  bookmark: Bookmark;
  handleBookmarkDelete: (id: number | undefined) => void;
  handleClose: () => void;
}

const BookmarkCard: FC<IBookmarkCardProps> = ({
  bookmark,
  handleBookmarkDelete,
  handleClose,
}) => {
  const history = useHistory();

  const handleBookmarkClick = () => {
    handleClose();
    history.push(
      `/${bookmark.course_type === 0 ? "theory" : "practical"}/${
        bookmark.bundleId
      }/${bookmark.lessonId}/${bookmark.materialId}`
    );
  };

  return (
    <div className="flex items-center justify-between bg-white py-3 px-6 mb-1">
      <section className="flex items-center">
        <p onClick={handleBookmarkClick} className="cursor-pointer">
          {bookmark?.name}
        </p>
      </section>
      <Tooltip title="Delete">
        <img
          src="./assets/delete.svg"
          alt="Delete Bookmark"
          className="cursor-pointer"
          onClick={() => handleBookmarkDelete(bookmark?.id)}
        />
      </Tooltip>
    </div>
  );
};
