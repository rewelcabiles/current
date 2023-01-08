import {useSelector} from "react-redux";
import SharingModal from "../SharingModal/SharingModal";
import AccountSettings from "../Settings/AccountSettings/AccountSettings";
export default function ModalManager() {
  const currentModal = useSelector((state) => state.uiModal.modal);
  if (!currentModal) {
    return null;
  }
  if (currentModal === "ShareOptions") {
    return <SharingModal />;
  } else if (currentModal === "AccountSettings") {
    return <AccountSettings />;
  }
}