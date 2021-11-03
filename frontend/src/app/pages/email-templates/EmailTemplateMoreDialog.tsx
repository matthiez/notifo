/*
 * Notifo.io
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
 */

import { Forms } from '@app/framework';
import { EmailTemplateDto } from '@app/service';
import { texts } from '@app/texts';
import { Formik } from 'formik';
import * as React from 'react';
import { Button, Form, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

export interface EmailTemplateMoreDialogProps {
    // The template to edit.
    template: EmailTemplateDto;

    // Invoked when closed.
    onClose?: () => void;
}

export const EmailTemplateMoreDialog = (props: EmailTemplateMoreDialogProps) => {
    const { onClose, template } = props;

    const doCloseForm = React.useCallback(() => {
        onClose && onClose();
    }, [onClose]);

    const doSave = React.useCallback((params: any) => {
        Object.assign(template, params);

        doCloseForm();
    }, [doCloseForm, template]);

    return (
        <Modal isOpen={true} toggle={doCloseForm}>
            <Formik<EmailTemplateDto> initialValues={template} onSubmit={doSave} enableReinitialize>
                {({ handleSubmit }) => (
                    <Form onSubmit={handleSubmit}>
                        <ModalHeader toggle={doCloseForm}>
                            {texts.common.settings}
                        </ModalHeader>

                        <ModalBody>
                            <fieldset>
                                <Forms.Text name='fromEmail' vertical
                                    label={texts.common.fromEmail} />

                                <Forms.Text name='fromName' vertical
                                    label={texts.common.fromName} />
                            </fieldset>
                        </ModalBody>
                        <ModalFooter className='justify-content-between'>
                            <Button type='button' color='' onClick={doCloseForm}>
                                {texts.common.cancel}
                            </Button>
                            <Button type='submit' color='primary'>
                                {texts.common.save}
                            </Button>
                        </ModalFooter>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
};