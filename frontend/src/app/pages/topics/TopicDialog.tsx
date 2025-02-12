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
import { TopicDto, TopicQueryScope, UpsertTopicDto } from '@app/service';
import { Forms } from '@app/shared/components';
import { ALLOWED_MODES, CHANNELS } from '@app/shared/utils/model';
import { upsertTopic, useApp, useTopics } from '@app/state';
import { texts } from '@app/texts';

const FormSchema = Yup.object({
    // Required topic path.
    path: Yup.string()
        .label(texts.common.topicPath).requiredI18n(),

    // Required name
    name: Yup.object()
        .label(texts.common.name).atLeastOneStringI18n(),
});

export interface TopicDialogProps {
    // The Topic to edit.
    topic?: TopicDto;

    // The current list scope.
    scope: TopicQueryScope;

    // Invoked when closed.
    onClose?: () => void;
}

export const TopicDialog = (props: TopicDialogProps) => {
    const { onClose, scope, topic } = props;

    const dispatch = useDispatch<any>();
    const app = useApp()!;
    const appId = app.id;
    const appLanguages = app.languages;
    const upserting = useTopics(x => x.upserting);
    const upsertingError = useTopics(x => x.upsertingError);
    const [language, setLanguage] = React.useState(appLanguages[0]);
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
    }, [dispatch, onClose, upserting, upsertingError, wasUpserting]);

    const doSave = useEventCallback((params: UpsertTopicDto) => {
        dispatch(upsertTopic({ appId, params, scope }));
    });
    
    const defaultValues: any = React.useMemo(() => {
        const result: Partial<TopicDto> = Types.clone(topic || {});

        result.channels ||= {};

        for (const channel of CHANNELS) {
            result.channels[channel] ||= 'Allowed';
        }

        return result;
    }, [topic]);

    const form = useForm<UpsertTopicDto>({ resolver: yupResolver<any>(FormSchema), defaultValues, mode: 'onChange' });

    return (
        <Modal isOpen={true} size='lg' backdrop={false} toggle={onClose}>
            <FormProvider {...form}>
                <Form onSubmit={form.handleSubmit(doSave)}>
                    <ModalHeader toggle={onClose}>
                        {texts.topics.createHeader}
                    </ModalHeader>

                    <ModalBody>
                        <fieldset className='mt-3' disabled={upserting}>
                            <Forms.Text name='path' placeholder='news/features/tech'
                                label={texts.common.topicPath} />

                            <Forms.LocalizedText name='name'
                                placeholder={texts.topics.namePlaceholder}
                                label={texts.common.name}
                                language={language}
                                languages={appLanguages}
                                onLanguageSelect={setLanguage}
                            />

                            <Forms.LocalizedTextArea name='description'
                                placeholder={texts.topics.descriptionPlaceholder}
                                label={texts.common.description}
                                language={language}
                                languages={appLanguages}
                                onLanguageSelect={setLanguage}
                            />

                            <Forms.Boolean name='showAutomatically'
                                label={texts.topics.showAutomatically} hints={texts.topics.showAutomaticallyHints} />

                            <hr />

                            {CHANNELS.map(channel =>
                                <Forms.Select key={channel} name={`channels.${channel}`}
                                    label={(texts.notificationSettings as any)[channel].title} options={ALLOWED_MODES} />,
                            )}
                        </fieldset>

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
