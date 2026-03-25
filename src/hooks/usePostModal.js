// src/hooks/usePostModal.js
import { useDispatch, useSelector } from "react-redux";
import { openPostModal, closePostModal } from "../store/postModalSlice";

export const usePostModal = () => {
  const dispatch = useDispatch();
  const { isOpen, postId, context } = useSelector(state => state.postModal);

  const openModal = (id, ctx = 'feed') => {
    dispatch(openPostModal({ id, context: ctx }));
  };

  const closeModal = () => {
    dispatch(closePostModal());
  };

  return { isOpen, postId, context, openModal, closeModal };
};
