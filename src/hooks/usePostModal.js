// src/hooks/usePostModal.js
import { useDispatch, useSelector } from "react-redux";
import { openPostModal, closePostModal } from "../store/postModalSlice";

export const usePostModal = () => {
  const dispatch = useDispatch();
  const { isOpen, postId } = useSelector(state => state.postModal);

  const openModal = (id) => {
    console.log('open: ', id)
    dispatch(openPostModal(id));
  };

  const closeModal = () => {
    dispatch(closePostModal());
  };

  return { isOpen, postId, openModal, closeModal };
};
