import React, { useCallback, useState } from "react";
import '../../styles/modal.css';

/**
 * Reusable modal hook.
 *
 * @returns {{
 *   isOpen: boolean,
 *   openModal: (options?: Object) => void,
 *   closeModal: () => void,
 *   modalProps: Object
 * }}
 */
export const useModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [modalProps, setModalProps] = useState({});

    const openModal = useCallback((options = {}) => {
        setModalProps(options);
        setIsOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsOpen(false);
    }, []);

    return {
        isOpen,
        openModal,
        closeModal,
        modalProps,
    };
};

/**
 * Modal popup component.
 *
 * @param {Object} props - Props for the modal popup.
 * @param {"small"|"medium"|"large"} [props.size="medium"] - Controls the size of the modal.
 * @param {Array<React.ReactNode>} [props.footerActions] - Actions or buttons displayed in the modal footer.
 * @param {string} [props.title="Modal"] - The title displayed at the top of the modal.
 * @param {React.ReactNode} [props.body=null] - Content displayed inside the modal body.
 * @param {...*} props - Additional props passed to the modal.
 *
 * @returns {JSX.Element|null} The rendered modal popup.
 */
export const Modal = ({
    size = "small",
    footerActions = [],
    title = "Modal",
    body = null,
    onClose,
    isOpen = false,
    ...props
}) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div
            className={`modal-overlay modal-${size}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            {...props}
        >
            <div className="modal">
                <div className="modal-header">
                    <h2 id="modal-title">{title}</h2>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                </div>

                <div className="modal-body">
                    {body}
                </div>

                {footerActions.length > 0 && (
                    <div className="modal-footer">
                        {footerActions.map((action, index) => (
                            <React.Fragment key={index}>
                                {action}
                            </React.Fragment>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};