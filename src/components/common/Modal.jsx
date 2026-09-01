import React, { useCallback, useState } from "react";
import '../../styles/modal.css';

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