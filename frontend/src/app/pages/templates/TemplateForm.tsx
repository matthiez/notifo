/*
 * Notifo.io
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
 */

import { yupResolver } from '@hookform/resolvers/yup';
import classNames from 'classnames';
import * as React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { Button, Card, CardBody, CardHeader, Col, Form, Label, Row } from 'reactstrap';
import * as Yup from 'yup';
import { FormError, Icon, Loader, Types, useEventCallback } from '@app/framework';
import { TemplateDto } from '@app/service';
import { Forms, NotificationsForm } from '@app/shared/components';
import { upsertTemplate, useApp, useTemplates } from '@app/state';
import { texts } from '@app/texts';
import { NotificationPreview } from './NotificationPreview';

const FormSchema = Yup.object({
    // Required template code
    code: Yup.string()
        .label(texts.common.code).requiredI18n(),

    // Subject is required
    formatting: Yup.object({
        subject: Yup.object().label(texts.common.subject).atLeastOneStringI18n(),
    }),
});

export interface TemplateFormProps {
    // The template to edit.
    template?: TemplateDto;

    // The current language.
    language: string;

    // Triggered when the language is selected.
    onLanguageSelect: (language: string) => void;

    // Triggered when closed.
    onClose: () => void;
}

export const TemplateForm = (props: TemplateFormProps) => {
    const {
        language,
        onClose,
        onLanguageSelect,
        template,
    } = props;

    const dispatch = useDispatch<any>();
    const app = useApp()!;
    const appId = app.id;
    const appLanguages = app.languages;
    const upserting = useTemplates(x => x.upserting);
    const upsertingError = useTemplates(x => x.upsertingError);
    const [viewFullscreen, setViewFullscreen] = React.useState<boolean>(false);

    const doPublish = useEventCallback((params: TemplateDto) => {
        dispatch(upsertTemplate({ appId, params }));
    });

    const doToggleFullscreen = useEventCallback(() => {
        setViewFullscreen(x => !x);
    });

    const defaultValues: any = React.useMemo(() => {
        return Types.clone(template || {});
    }, [template]);

    const form = useForm<TemplateDto>({ resolver: yupResolver<any>(FormSchema), defaultValues, mode: 'onChange' });

    return (
        <FormProvider {...form}>
            <Form onSubmit={form.handleSubmit(doPublish)}>
                <Card className={classNames('template-form', 'slide-right', { ['fullscreen-mode']: viewFullscreen })}>
                    <CardHeader>
                        <Row className='align-items-center d-nowrap'>
                            <Col>
                                {template ? (
                                    <h3 className='truncate'>{texts.templates.templateEdit} {template.code}</h3>
                                ) : (
                                    <h3 className='truncate'>{texts.templates.templateNew}</h3>
                                )}
                            </Col>
                            <Col xs='auto'>
                                <Button type='submit' color='success' disabled={upserting}>
                                    <Loader light small visible={upserting} /> {texts.common.save}
                                </Button>
                            </Col>
                        </Row>

                        <button type='button' className='fullscreen' onClick={doToggleFullscreen}>
                            <Icon type={viewFullscreen ? 'fullscreen_exit' : 'fullscreen'} />
                        </button>

                        <button type='button' className='close' onClick={onClose}>
                            <span aria-hidden='true'>×</span>
                        </button>
                    </CardHeader>

                    <CardBody>
                        <Row className='template-form-inner'>
                            <Col xs='auto'>
                                <FormError error={upsertingError} />

                                <fieldset disabled={upserting}>
                                    <Forms.Text name='code' vertical
                                        label={texts.common.code} />
                                </fieldset>

                                <NotificationsForm.Formatting vertical
                                    onLanguageSelect={onLanguageSelect}
                                    language={language}
                                    languages={appLanguages}
                                    field='formatting' disabled={upserting} />

                                <hr />

                                <NotificationsForm.Settings field='settings'
                                    disabled={upserting} />
                                    
                                <NotificationsForm.Scheduling field='scheduling'
                                    disabled={upserting} />
                            </Col>
                            <Col xs='auto'>
                                <div className='template-form-preview sticky-top'>
                                    <Label>{texts.common.preview}</Label>
                                    
                                    <NotificationPreview formatting={form.watch('formatting')} language={language}></NotificationPreview>
                                </div>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            </Form>
        </FormProvider>
    );
};
