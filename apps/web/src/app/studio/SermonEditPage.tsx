import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import AnalyticsSermonView from '@/app/analytics/AnalyticsSermonView';
import { SermonEditSidebar } from '@/components/shared/sermon/SermonEditSidebar';
import { useQueryClient } from '@tanstack/react-query';
import { Copy, Loader2, Save, Undo2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { StudioConfirmDialog } from '@/components/shared/studio/StudioConfirmDialog';
import { STUDIO_HEADER_ACTION } from '@/components/shared/studio/studio-header-actions';
import { SERMON_EDIT } from '@/components/shared/sermon/sermon-edit-ui';
import {
    SermonListAudioGlyph,
    SermonTableStatusPill,
} from '@/components/shared/my-sermons/my-sermons-ui';
import { isApiHttp2xxErrorEnvelope } from '@/api/core/api-envelope-toast';
import { sermonQueryKeys } from '@/constants/sermon-query-keys';
import {
    usePublishSermonMutation,
    useSermonByIdQuery,
    useUpdateSermonMutation,
} from '@/hooks/app/useSermon';
import { useMinister } from '@/context/minister/useMinister';
import { useCreator } from '@/context/creator/useCreator';
import useContextType from '@/hooks/shared/useContextType';
import storage from '@/api/services/local-storage';
import {
    PATH_SEG_SERMONS_UPLOAD_FILE,
    studioSermonAnalyticsPath,
    studioSermonsListPath,
    studioUploadPath,
} from '@/routes/paths';
import { resolveStudioSermonOwnerId } from '@/utils/studio-sermon-owner.util';
import {
    buildPublishPayloadFromEditForm,
    editFormToUpdateDto,
    mapApiDocToEditForm,
    parseTagsInput,
    tagsToInputValue,
    type SermonEditFormState,
} from '@/utils/sermon-edit-form.util';
import {
    isUploadStatusBlockingVisibilityChange,
    visibilityLabel,
    type SermonVisibilityValue,
} from '@/utils/sermon-visibility.util';
import { uploadSermonCoverForSermon } from '@/services/upload/sermon-cover-upload.service';
import type { PublishSermonDTO } from '@/dtos/sermon.dto';
import { cn } from '@/lib/utils';
import {
    isSermonDetailNotFoundError,
    isSermonDraftDocument,
} from '@/utils/sermon-info-map.util';
import {
    navigateOnSermonEdit,
    resolveSermonEditDestination,
} from '@/utils/sermon-edit-routing.util';

const VISIBILITY_OPTIONS: {
    value: SermonVisibilityValue;
    label: string;
    description: string;
}[] = [
    {
        value: 'public',
        label: 'Public',
        description: 'Anyone can find and listen',
    },
    {
        value: 'unlisted',
        label: 'Unlisted',
        description: 'Only people with the link can listen',
    },
    {
        value: 'private',
        label: 'Private',
        description: 'Only you can listen',
    },
];

const studioSelectTriggerClass = cn(
    '!w-full min-w-0 h-10 border-[#707070] bg-[#242325] font-matter text-sm text-[#eaeaea] shadow-none',
    'focus-visible:ring-[#08ffdb]/40 [&_svg]:text-[#bdbdbd]',
);

const SermonEditPage = () => {
    const { sermonId, studioCode } = useParams<{
        sermonId: string;
        studioCode: string;
    }>();
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    const isAnalyticsSection = /\/analytics\/?$/.test(location.pathname);
    const updateMutation = useUpdateSermonMutation();
    const publishMutation = usePublishSermonMutation();
    const { minister } = useMinister();
    const { creatorId } = useCreator();
    const { userContext } = useContextType();
    const user = userContext.user as Record<string, unknown> | null;
    const ministerId = resolveStudioSermonOwnerId(
        user,
        minister?.id,
        creatorId,
    );

    const code = studioCode?.trim() || storage.getStudioCode()?.trim() || '';

    const { data, isLoading, isError, error, refetch } = useSermonByIdQuery(
        sermonId,
        {
            enabled: Boolean(sermonId),
            staleTime: 0,
            refetchOnMount: 'always',
        },
    );

    const [form, setForm] = useState<SermonEditFormState | null>(null);
    const [baseline, setBaseline] = useState<SermonEditFormState | null>(null);
    const [tagsInput, setTagsInput] = useState('');
    const [saving, setSaving] = useState(false);
    const [pendingCover, setPendingCover] = useState<File | null>(null);
    const [confirmDowngradeOpen, setConfirmDowngradeOpen] = useState(false);
    const [pendingSaveAction, setPendingSaveAction] = useState<
        'save' | 'draft' | 'publish' | null
    >(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    const sermonDoc =
        data && typeof data === 'object'
            ? (data as Record<string, unknown>)
            : undefined;
    const isDraftSermon =
        sermonDoc != null && isSermonDraftDocument(sermonDoc);

    useEffect(() => {
        if (
            !code ||
            !sermonId ||
            isAnalyticsSection ||
            !sermonDoc ||
            !isDraftSermon
        ) {
            return;
        }
        navigateOnSermonEdit(navigate, code, sermonId, {
            doc: sermonDoc,
            replace: true,
        });
    }, [
        code,
        isAnalyticsSection,
        isDraftSermon,
        navigate,
        sermonDoc,
        sermonId,
    ]);

    useEffect(() => {
        if (!sermonDoc || !sermonId) {
            return;
        }
        if (!isAnalyticsSection && isDraftSermon) {
            return;
        }
        const next = mapApiDocToEditForm(sermonDoc, sermonId);
        setForm(next);
        setBaseline(next);
        setTagsInput(tagsToInputValue(next.tags));
        setPendingCover(null);
    }, [isAnalyticsSection, isDraftSermon, sermonDoc, sermonId]);

    const isDirty = useMemo(() => {
        if (!form || !baseline) {
            return false;
        }
        if (pendingCover) {
            return true;
        }
        return (
            form.title !== baseline.title ||
            form.description !== baseline.description ||
            form.category !== baseline.category ||
            form.visibility !== baseline.visibility ||
            tagsInput !== tagsToInputValue(baseline.tags)
        );
    }, [baseline, form, pendingCover, tagsInput]);

    const pipelineBlocking = isUploadStatusBlockingVisibilityChange(
        form?.uploadStatus,
    );
    const canPublish =
        form?.isDraft &&
        form.hasAudio &&
        !pipelineBlocking &&
        form.title.trim().length >= 3 &&
        form.description.trim().length >= 10;

    const invalidateLists = useCallback(async () => {
        await queryClient.invalidateQueries({
            queryKey: sermonQueryKeys.all,
        });
        if (ministerId) {
            await queryClient.invalidateQueries({
                queryKey: sermonQueryKeys.ministerListRoot(ministerId),
            });
        }
    }, [ministerId, queryClient]);

    const runSave = useCallback(
        async (action: 'save' | 'draft' | 'publish') => {
            if (!form || !sermonId) {
                return;
            }
            setSaving(true);
            try {
                if (pendingCover) {
                    await uploadSermonCoverForSermon(sermonId, pendingCover);
                }

                const tags = parseTagsInput(tagsInput);
                const nextForm: SermonEditFormState = { ...form, tags };

                const updateRes = await updateMutation.mutateAsync({
                    id: sermonId,
                    payload: editFormToUpdateDto(nextForm),
                });
                if (updateRes.error) {
                    if (!isApiHttp2xxErrorEnvelope(updateRes)) {
                        toast.error(
                            updateRes.message || 'Could not save changes.',
                        );
                    }
                    return;
                }

                if (action === 'draft' || action === 'publish') {
                    const userId = storage.getUserID();
                    const publishRes = await publishMutation.mutateAsync({
                        id: sermonId,
                        payload: buildPublishPayloadFromEditForm(
                            nextForm,
                            sermonId,
                            ministerId || userId,
                            userId,
                            action === 'publish' ? 'published' : 'draft',
                        ) as unknown as PublishSermonDTO,
                    });
                    if (publishRes.error) {
                        if (!isApiHttp2xxErrorEnvelope(publishRes)) {
                            toast.error(
                                publishRes.message ||
                                    (action === 'publish'
                                        ? 'Could not publish.'
                                        : 'Could not save draft.'),
                            );
                        }
                        return;
                    }
                    toast.success(
                        action === 'publish'
                            ? 'Sermon published.'
                            : 'Draft saved.',
                    );
                } else {
                    toast.success('Changes saved.');
                }

                await invalidateLists();
                if (code) {
                    navigate(studioSermonsListPath(code));
                }
            } catch (e: unknown) {
                toast.error(
                    e && typeof e === 'object' && 'message' in e
                        ? String((e as { message: unknown }).message)
                        : 'Could not save changes.',
                );
            } finally {
                setSaving(false);
                setPendingSaveAction(null);
            }
        },
        [
            code,
            form,
            invalidateLists,
            ministerId,
            navigate,
            pendingCover,
            publishMutation,
            sermonId,
            tagsInput,
            updateMutation,
        ],
    );

    const requestSave = useCallback(
        (action: 'save' | 'draft' | 'publish') => {
            if (!form || !baseline) {
                return;
            }
            if (
                baseline.visibility === 'public' &&
                form.visibility !== baseline.visibility &&
                (form.visibility === 'private' ||
                    form.visibility === 'unlisted')
            ) {
                setPendingSaveAction(action);
                setConfirmDowngradeOpen(true);
                return;
            }
            void runSave(action);
        },
        [baseline, form, runSave],
    );

    const handleUndoChanges = useCallback(() => {
        if (!baseline) {
            return;
        }
        setForm(baseline);
        setTagsInput(tagsToInputValue(baseline.tags));
        setPendingCover(null);
        if (coverInputRef.current) {
            coverInputRef.current.value = '';
        }
    }, [baseline]);

    const handleReplaceAudio = useCallback(() => {
        if (!sermonId || !code) {
            return;
        }
        navigate(studioUploadPath(code, PATH_SEG_SERMONS_UPLOAD_FILE), {
            state: { resumeSermonId: sermonId, editMode: true },
        });
    }, [code, navigate, sermonId]);

    const handleCoverPick = useCallback(
        (file: File | null) => {
            if (!file) {
                return;
            }
            setPendingCover(file);
            const preview = URL.createObjectURL(file);
            setForm((prev) =>
                prev ? { ...prev, thumbnailPreview: preview } : prev,
            );
        },
        [],
    );

    if (!sermonId) {
        return null;
    }

    if (
        isLoading ||
        (!form && !isError) ||
        (!isAnalyticsSection && isDraftSermon)
    ) {
        return (
            <div className={SERMON_EDIT.loadingShell}>
                <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
                <p className="font-matter text-sm">Loading sermon…</p>
            </div>
        );
    }

    if (isError || !form) {
        const notFound = isSermonDetailNotFoundError(error);
        return (
            <div
                className={cn(
                    SERMON_EDIT.loadingShell,
                    'gap-4 px-4 text-center',
                )}
            >
                <p className="max-w-md font-matter text-sm text-[#9d9d9d]">
                    {notFound
                        ? 'This sermon could not be found. It may have been removed.'
                        : 'Could not load sermon for editing.'}
                </p>
                {!notFound ? (
                    <Button type="button" variant="outline" onClick={() => void refetch()}>
                        Retry
                    </Button>
                ) : null}
                {code ? (
                    <Button type="button" variant="ghost" asChild>
                        <Link to={studioSermonsListPath(code)}>
                            Back to My Sermons
                        </Link>
                    </Button>
                ) : null}
            </div>
        );
    }

    const listPath = code ? studioSermonsListPath(code) : '#';
    const detailsDestination =
        code && sermonId
            ? resolveSermonEditDestination(code, sermonId, {
                  isDraft: form.isDraft,
              })
            : null;
    const detailsPath = detailsDestination?.path ?? '#';
    const detailsPathState =
        detailsDestination?.kind === 'upload-wizard'
            ? detailsDestination.state
            : undefined;
    const analyticsPath =
        code && sermonId
            ? studioSermonAnalyticsPath(code, sermonId)
            : '#';

    const sidebarTitle = form.title.trim() || 'Untitled sermon';

    return (
        <div className={SERMON_EDIT.page}>
            <StudioConfirmDialog
                open={confirmDowngradeOpen}
                onOpenChange={setConfirmDowngradeOpen}
                title="Change visibility?"
                description={
                    <p>
                        You&apos;re changing this sermon from public. It may
                        disappear from search and discovery.
                    </p>
                }
                confirmLabel="Save changes"
                confirmTone="destructive"
                onConfirm={() => {
                    if (pendingSaveAction) {
                        void runSave(pendingSaveAction);
                    }
                    setConfirmDowngradeOpen(false);
                }}
            />

            <div className={SERMON_EDIT.shell}>
                <SermonEditSidebar
                    listPath={listPath}
                    detailsPath={detailsPath}
                    detailsPathState={detailsPathState}
                    analyticsPath={analyticsPath}
                    sermonTitle={sidebarTitle}
                    thumbnailPreview={form.thumbnailPreview}
                    activeSection={
                        isAnalyticsSection ? 'analytics' : 'details'
                    }
                    onReplaceAudio={handleReplaceAudio}
                />

                <div className={SERMON_EDIT.contentColumn}>
            {isAnalyticsSection ? (
                <>
                    <header className={SERMON_EDIT.header}>
                        <h1 className={SERMON_EDIT.headerTitle}>
                            Analytics
                        </h1>
                    </header>
                    <div className={SERMON_EDIT.main}>
                        <div className={SERMON_EDIT.mainInner}>
                            {code && sermonId ? (
                                <AnalyticsSermonView
                                    studioCode={code}
                                    sermonId={sermonId}
                                    embedded
                                    editPath={detailsPath}
                                />
                            ) : null}
                        </div>
                    </div>
                </>
            ) : (
                <>
            <header className={SERMON_EDIT.header}>
                <h1 className={SERMON_EDIT.headerTitle}>Sermon details</h1>
                <div className={SERMON_EDIT.headerActions}>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={saving || (!isDirty && !pendingCover)}
                        className={STUDIO_HEADER_ACTION.outline}
                        onClick={handleUndoChanges}
                    >
                        <Undo2 className="size-4" aria-hidden />
                        Undo changes
                    </Button>
                    <Button
                        type="button"
                        disabled={
                            saving || (!isDirty && !pendingCover)
                        }
                        className={STUDIO_HEADER_ACTION.primary}
                        onClick={() => requestSave('save')}
                    >
                        {saving ? (
                            <>
                                <Loader2
                                    className="size-4 animate-spin"
                                    aria-hidden
                                />
                                Saving…
                            </>
                        ) : (
                            <>
                                <Save className="size-4" aria-hidden />
                                Save changes
                            </>
                        )}
                    </Button>
                    {form.isDraft ? (
                        <Button
                            type="button"
                            variant="outline"
                            disabled={saving || !isDirty}
                            className={STUDIO_HEADER_ACTION.outline}
                            onClick={() => requestSave('draft')}
                        >
                            Save as draft
                        </Button>
                    ) : null}
                    {form.isDraft && form.hasAudio ? (
                        <Button
                            type="button"
                            disabled={saving || !canPublish}
                            className={STUDIO_HEADER_ACTION.primary}
                            onClick={() => requestSave('publish')}
                        >
                            Publish
                        </Button>
                    ) : null}
                </div>
            </header>

            <div className={SERMON_EDIT.main}>
                <div className={SERMON_EDIT.mainInner}>
                <div className={SERMON_EDIT.grid}>
                    <div className="space-y-4">
                        <section className={SERMON_EDIT.section}>
                            <h2 className={SERMON_EDIT.sectionTitle}>
                                Basic info
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label
                                        htmlFor="sermon-edit-title"
                                        className={SERMON_EDIT.label}
                                    >
                                        Title (required)
                                    </label>
                                    <input
                                        id="sermon-edit-title"
                                        className={SERMON_EDIT.input}
                                        value={form.title}
                                        onChange={(e) =>
                                            setForm((prev) =>
                                                prev
                                                    ? {
                                                          ...prev,
                                                          title: e.target
                                                              .value,
                                                      }
                                                    : prev,
                                            )
                                        }
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="sermon-edit-description"
                                        className={SERMON_EDIT.label}
                                    >
                                        Description
                                    </label>
                                    <textarea
                                        id="sermon-edit-description"
                                        className={SERMON_EDIT.textarea}
                                        value={form.description}
                                        onChange={(e) =>
                                            setForm((prev) =>
                                                prev
                                                    ? {
                                                          ...prev,
                                                          description:
                                                              e.target.value,
                                                      }
                                                    : prev,
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        </section>

                        <section className={SERMON_EDIT.section}>
                            <h2 className={SERMON_EDIT.sectionTitle}>
                                Thumbnail
                            </h2>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                                <div className="relative h-[120px] w-[213px] shrink-0 overflow-hidden rounded-md border border-[#545454]/50 bg-[#242325]">
                                    {form.thumbnailPreview ? (
                                        <img
                                            src={form.thumbnailPreview}
                                            alt=""
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-xs text-[#707070]">
                                            No thumbnail
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <input
                                        ref={coverInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="sr-only"
                                        onChange={(e) =>
                                            handleCoverPick(
                                                e.target.files?.[0] ?? null,
                                            )
                                        }
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="border-[#707070] text-[#eaeaea] hover:bg-white/5"
                                        onClick={() =>
                                            coverInputRef.current?.click()
                                        }
                                    >
                                        Upload thumbnail
                                    </Button>
                                    <p className="font-matter text-xs text-[#9d9d9d]">
                                        JPEG, PNG, or WEBP. Saved when you
                                        click Save.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className={SERMON_EDIT.section}>
                            <h2 className={SERMON_EDIT.sectionTitle}>
                                Details
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label
                                        htmlFor="sermon-edit-category"
                                        className={SERMON_EDIT.label}
                                    >
                                        Category / topic
                                    </label>
                                    <input
                                        id="sermon-edit-category"
                                        className={SERMON_EDIT.input}
                                        value={form.category}
                                        onChange={(e) =>
                                            setForm((prev) =>
                                                prev
                                                    ? {
                                                          ...prev,
                                                          category:
                                                              e.target.value,
                                                      }
                                                    : prev,
                                            )
                                        }
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="sermon-edit-tags"
                                        className={SERMON_EDIT.label}
                                    >
                                        Tags
                                    </label>
                                    <input
                                        id="sermon-edit-tags"
                                        className={SERMON_EDIT.input}
                                        placeholder="faith, hope, series-name"
                                        value={tagsInput}
                                        onChange={(e) =>
                                            setTagsInput(e.target.value)
                                        }
                                    />
                                    <p className="mt-1 font-matter text-xs text-[#9d9d9d]">
                                        Comma-separated
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    <aside className="space-y-4">
                        <div className={SERMON_EDIT.sidebarCard}>
                            <div className={SERMON_EDIT.previewBox}>
                                <SermonListAudioGlyph />
                                <p className="mt-2 font-matter-medium text-sm text-[#eaeaea]">
                                    {form.durationLabel}
                                </p>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <SermonTableStatusPill
                                    status={
                                        form.isDraft ? 'draft' : 'published'
                                    }
                                />
                            </div>
                            <div className={SERMON_EDIT.metaRow}>
                                <span className={SERMON_EDIT.metaLabel}>
                                    Share link
                                </span>
                                <div className="flex items-start gap-2">
                                    <span
                                        className={cn(
                                            SERMON_EDIT.metaValue,
                                            'flex-1 font-mono text-xs',
                                        )}
                                    >
                                        {form.shareableUrl}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 shrink-0 px-2"
                                        aria-label="Copy share link"
                                        onClick={() => {
                                            void navigator.clipboard
                                                .writeText(form.shareableUrl)
                                                .then(
                                                    () =>
                                                        toast.success(
                                                            'Link copied to clipboard.',
                                                        ),
                                                    () =>
                                                        toast.error(
                                                            'Could not copy link.',
                                                        ),
                                                );
                                        }}
                                    >
                                        <Copy
                                            className="h-3.5 w-3.5"
                                            aria-hidden
                                        />
                                    </Button>
                                </div>
                            </div>
                            {form.itemId ? (
                                <div className={SERMON_EDIT.metaRow}>
                                    <span className={SERMON_EDIT.metaLabel}>
                                        Upload reference
                                    </span>
                                    <span
                                        className={cn(
                                            SERMON_EDIT.metaValue,
                                            'font-mono text-xs',
                                        )}
                                    >
                                        {form.itemId}
                                    </span>
                                </div>
                            ) : null}
                        </div>

                        <div className={SERMON_EDIT.sidebarCard}>
                            <h2 className={SERMON_EDIT.sectionTitle}>
                                Visibility
                            </h2>
                            <Select
                                value={form.visibility}
                                disabled={pipelineBlocking || saving}
                                onValueChange={(v) =>
                                    setForm((prev) =>
                                        prev
                                            ? {
                                                  ...prev,
                                                  visibility:
                                                      v as SermonVisibilityValue,
                                              }
                                            : prev,
                                    )
                                }
                            >
                                <SelectTrigger
                                    className={studioSelectTriggerClass}
                                    aria-label="Visibility"
                                >
                                    <SelectValue>
                                        {visibilityLabel(form.visibility)}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent className="z-50 border-[#545454]/50 bg-[#333234] text-[#eaeaea]">
                                    {VISIBILITY_OPTIONS.map((opt) => (
                                        <SelectItem
                                            key={opt.value}
                                            value={opt.value}
                                            className="focus:bg-white/10"
                                        >
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="font-matter text-xs text-[#9d9d9d]">
                                {
                                    VISIBILITY_OPTIONS.find(
                                        (o) => o.value === form.visibility,
                                    )?.description
                                }
                            </p>
                        </div>

                        <div className={SERMON_EDIT.sidebarCard}>
                            <h2 className={SERMON_EDIT.sectionTitle}>Audio</h2>
                            {form.hasAudio ? (
                                <p className="font-matter text-sm text-[#bdbdbd]">
                                    Replace the audio file if you need to fix
                                    or remaster this sermon.
                                </p>
                            ) : (
                                <p className="font-matter text-sm text-[#bdbdbd]">
                                    No audio yet. Upload a file to continue.
                                </p>
                            )}
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full border-[#707070] text-[#eaeaea] hover:bg-white/5"
                                onClick={handleReplaceAudio}
                            >
                                <Upload
                                    className="mr-2 h-4 w-4"
                                    aria-hidden
                                />
                                {form.hasAudio
                                    ? 'Replace audio'
                                    : 'Upload audio'}
                            </Button>
                        </div>
                    </aside>
                </div>
                </div>
            </div>
                </>
            )}
                </div>
            </div>
        </div>
    );
};

export default SermonEditPage;
