import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui";
import styles from "./ConfirmDialog.module.scss";

interface ConfirmDialogProps {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isOpen: boolean;
  isConfirming?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmDialog({
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isOpen,
  isConfirming = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => (!open ? onCancel() : undefined)}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.dialog}>
          <Dialog.Close className={styles.closeButton} aria-label="Close confirmation dialog">
            <X size={16} />
          </Dialog.Close>
          <Dialog.Title className={styles.title}>{title}</Dialog.Title>
          {description ? <Dialog.Description className={styles.description}>{description}</Dialog.Description> : null}
          <div className={styles.actions}>
            <Button variant="secondary" onClick={onCancel} disabled={isConfirming}>
              {cancelLabel}
            </Button>
            <Button variant="danger" onClick={onConfirm} isLoading={isConfirming}>
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
