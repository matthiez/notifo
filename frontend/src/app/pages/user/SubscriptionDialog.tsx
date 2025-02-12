/*
 * Notifo.io
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
 */

import { yupResolver } from '@hookform/resolvers/yup';
import * as React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { Button, Form, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import * as Yup from 'yup';
import { FormError, Loader, Types, useEventCallback } from '@app/framework';
import { SubscriptionDto } from '@app/service';
import { Forms, NotificationsForm } from '@app/shared/components';
import { upsertSubscription, useApp, useSubscriptions } from '@app/state';
import { texts } from '@app/texts';

const FormSchema = Yup.object().shape({
    // Required topic name.
    topicPrefix: Yup.string()
        .label(texts.common.topic).requiredI18n().topicI18n(),
});

export interface SubscriptionDialogProps {
    // The subscription to edit.
    subscription?: SubscriptionDto;

    // The user id.
    userId: string;

    // Invoked when closed.
    onClose?: () => void;
}

export const SubscriptionDialog = (props: SubscriptionDialogProps) => {
    const { onClose, subscription, userId } = props;

    const dispatch = useDispatch<any>();
    const app = useApp()!;
    const appId = app.id;
    const upserting = useSubscriptions(x => x.upserting);
    const upsertingError = useSubscriptions(x => x.upsertingError);
    const [wasUpserting, setWasUpserting] = React.useState(false);

    React.useEffect(() => {
        if (upserting) {
            setWasUpserting(true);
        }
    }, [upserting]);

    React.useEffect(() => {
        if (!upserting && wasUpserting && !upsertingError) {
            onClose && onClose();
        }
    }, [onClose, upserting, upsertingError, wasUpserting]);

    const doSave = useEventCallback((params: SubscriptionDto) => {
        dispatch(upsertSubscription({ appId, userId, params: params as any }));
    });

    const defaultValues = React.useMemo(() => {
        return Types.clone(subscription || { topicPrefix: '' }) as any;
    }, [subscription]);

    const form = useForm<SubscriptionDto>({ resolver: yupResolver<any>(FormSchema), defaultValues, mode: 'onChange' });

    return (
        <Modal isOpen={true} size='lg' toggle={onClose}>
            <FormProvider {...form}>
                <Form onSubmit={form.handleSubmit(doSave)}>
                    <ModalHeader toggle={onClose}>
                        {subscription ? texts.subscriptions.editHeader : texts.subscriptions.createHeader}
                    </ModalHeader>

                    <ModalBody>
                        <fieldset className='mt-3' disabled={upserting}>
                            <Forms.Text name='topicPrefix'
                                label={texts.common.topic} />
                        </fieldset>

                        <NotificationsForm.Settings field='topicSettings'
                            disabled={upserting} />
                            
                        <NotificationsForm.Scheduling field='scheduling'
                            disabled={upserting} />

                        <FormError error={upsertingError} />
                    </ModalBody>
                    <ModalFooter className='justify-content-between'>
                        <Button type='button' color='none' onClick={onClose} disabled={upserting}>
                            {texts.common.cancel}
                        </Button>
                        <Button type='submit' color='primary' disabled={upserting}>
                            <Loader light small visible={upserting} /> {texts.common.save}
                        </Button>
                    </ModalFooter>
                </Form>
            </FormProvider>
        </Modal>
    );
};
