"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AuthFlowToast = () => {
  return (
    <ToastContainer
      position="top-center"
      autoClose={2600}
      hideProgressBar
      newestOnTop
      closeOnClick
      rtl
      pauseOnHover
      draggable
      theme="colored"
      toastClassName="font-yekanbakh"
    />
  );
};

export default AuthFlowToast;
