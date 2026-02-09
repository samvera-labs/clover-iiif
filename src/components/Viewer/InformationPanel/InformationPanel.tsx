import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ErrorBoundary } from "react-error-boundary";

import {
	ViewerContextStore,
	useViewerDispatch,
	useViewerState,
	type PluginConfig,
} from "src/context/viewer-context";

import {
	Content,
	List,
	Scroll,
	Trigger,
	Wrapper,
} from "./InformationPanel.styled";

import AnnotationPage from "./Annotation/Page";
import ContentSearch from "./ContentSearch/ContentSearch";
import Information from "./About/About";
import ContentStateAnnotationPage from "./ContentState/Page";
import { annotationMatchesMotivations } from "src/lib/annotation-helpers";

import { Label } from "src/components/Primitives";
import ErrorFallback from "src/components/UI/ErrorFallback/ErrorFallback";

import {
	AnnotationResources,
	AnnotationResource,
} from "src/types/annotations";
import {
	InternationalString,
	AnnotationPageNormalized,
	CanvasNormalized,
	AnnotationNormalized
} from "@iiif/presentation-3";

import { getAvailableTabs } from "src/lib/information-panel-helpers";

const UserScrollTimeout = 1500; // 1500ms without a user-generated scroll event reverts to auto-scrolling

interface NavigatorProps {
	activeCanvas: string;
	annotationResources?: AnnotationResources;
	searchServiceUrl?: string;
	setContentSearchResource: React.Dispatch<
		React.SetStateAction<AnnotationPageNormalized | undefined>
	>;
	contentSearchResource?: AnnotationResource;
	pluginsWithInfoPanel?: PluginConfig[];
}

export const InformationPanel: React.FC<NavigatorProps> = ({
	activeCanvas,
	annotationResources,
	searchServiceUrl,
	setContentSearchResource,
	contentSearchResource,
	pluginsWithInfoPanel,
}) => {
	const { t } = useTranslation();
	const dispatch: any = useViewerDispatch();
	const viewerState: ViewerContextStore = useViewerState();
	const {
		contentStateAnnotation,
		informationPanelResource,
		isAutoScrolling,
		isUserScrolling,
		vault,
		configOptions,
	} = viewerState;
	const { informationPanel } = configOptions;

	const renderAbout = informationPanel?.renderAbout;
	const renderAnnotation = informationPanel?.renderAnnotation;
	const canvas = vault.get({
		id: activeCanvas,
		type: "Canvas",
	}) as CanvasNormalized;

	const renderContentSearch = informationPanel?.renderContentSearch;
	const renderToggle = informationPanel?.renderToggle;
	const allowedAnnotationMotivations = configOptions?.annotations?.motivations;
	const contentStateAnnotationSource =
		// @ts-ignore
		contentStateAnnotation?.target?.source || contentStateAnnotation?.target;
	const hasContentStateAnnotation =
		Boolean(contentStateAnnotation) &&
		// @ts-ignore
		contentStateAnnotationSource.id === activeCanvas;
	const filteredAnnotationResources = useMemo(() => {
		if (!annotationResources) return [];
		if (!allowedAnnotationMotivations)
			return annotationResources;

		return annotationResources
			.map((annotationPage) => {
				if (!annotationPage?.items?.length) return null;

				const filteredItems = annotationPage.items.filter((item) => {
					const annotation = vault.get(item.id) as
						| AnnotationNormalized
						| undefined;
					return annotationMatchesMotivations(
						annotation,
						allowedAnnotationMotivations,
					);
				});

				if (!filteredItems.length) return null;

				return {
					...annotationPage,
					items: filteredItems,
				};
			})
			.filter(Boolean) as AnnotationResources;
	}, [annotationResources, allowedAnnotationMotivations, vault]);

	const hasAnnotations =
		Boolean(filteredAnnotationResources?.length) || hasContentStateAnnotation;

	function renderPluginInformationPanel(plugin: PluginConfig, i: number) {
		const PluginInformationPanelComponent = plugin?.informationPanel
			?.component as unknown as React.ElementType;

		if (PluginInformationPanelComponent === undefined) {
			return <></>;
		}

		return (
			<Content key={i} value={plugin.id}>
				<ErrorBoundary FallbackComponent={ErrorFallback}>
					<PluginInformationPanelComponent
						{...plugin?.informationPanel?.componentProps}
						canvas={canvas}
						useViewerDispatch={useViewerDispatch}
						useViewerState={useViewerState}
					/>
				</ErrorBoundary>
			</Content>
		);
	}

	/**
	 * Close the information panel
	 */
	const handleInformationPanelClose = () => {
		dispatch({
			type: "updateInformationOpen",
			isInformationOpen: false,
		});
	};

	useEffect(() => {
		const availableTabs = getAvailableTabs({
			informationPanel,
			annotationResources,
			contentSearchResource,
			pluginsWithInfoPanel,
		});

		const defaultTab =
			(informationPanel?.defaultTab &&
				availableTabs.includes(String(informationPanel.defaultTab)) &&
				informationPanel.defaultTab) ||
			availableTabs[0] ||
			"manifest-about";

		dispatch({
			type: "updateInformationPanelResource",
			informationPanelResource: defaultTab,
		});
	}, [
		informationPanel,
		annotationResources,
		contentSearchResource,
		pluginsWithInfoPanel,
		dispatch,
	]);

	function handleScroll() {
		if (!isAutoScrolling) {
			clearTimeout(isUserScrolling);
			const timeout = setTimeout(() => {
				dispatch({
					type: "updateUserScrolling",
					isUserScrolling: undefined,
				});
			}, UserScrollTimeout);

			dispatch({
				type: "updateUserScrolling",
				isUserScrolling: timeout,
			});
		}
	}

	const handleValueChange = (value: string) => {
		dispatch({
			type: "updateInformationPanelResource",
			informationPanelResource: value,
		});
	};

	return (
		<Wrapper
			data-testid="information-panel"
			defaultValue={informationPanelResource}
			onValueChange={handleValueChange}
			orientation="horizontal"
			value={informationPanelResource}
			className="clover-viewer-information-panel"
		>
			<List
				aria-label={t("informationPanelTabs")}
				data-testid="information-panel-list"
			>
				{renderToggle && (
					<Trigger
						value="manifest-back"
						data-value="manifest-back"
						onClick={handleInformationPanelClose}
						as={"button"}
					>
						{t("informationPanelTabsClose")}
					</Trigger>
				)}
				{renderAbout && (
					<Trigger value="manifest-about">
						{t("informationPanelTabsAbout")}
					</Trigger>
				)}
				{renderContentSearch && contentSearchResource && (
					<Trigger value="manifest-content-search">
						{t("informationPanelTabsSearch")}
					</Trigger>
				)}
				{renderAnnotation && hasAnnotations && (
					<Trigger value="manifest-annotations">
						{informationPanel?.annotationTabLabel ||
							t("informationPanelTabsAnnotations")}
					</Trigger>
				)}

				{pluginsWithInfoPanel &&
					pluginsWithInfoPanel.map((plugin, i) => (
						<Trigger key={i} value={plugin.id}>
							<Label
								label={plugin.informationPanel?.label as InternationalString}
							/>
						</Trigger>
					))}
			</List>
			<Scroll handleScroll={handleScroll}>
				{renderAbout && (
					<Content value="manifest-about">
						<Information />
					</Content>
				)}
				{renderContentSearch && contentSearchResource && (
					<Content value="manifest-content-search">
						<ContentSearch
							searchServiceUrl={searchServiceUrl}
							setContentSearchResource={setContentSearchResource}
							activeCanvas={activeCanvas}
							annotationPage={contentSearchResource}
						/>
					</Content>
				)}
				{renderAnnotation && hasAnnotations && filteredAnnotationResources && (
					<Content value="manifest-annotations">
						{contentStateAnnotation && hasContentStateAnnotation && (
							<ContentStateAnnotationPage
								contentStateAnnotation={contentStateAnnotation}
							/>
						)}
						{filteredAnnotationResources.map((annotationPage) => (
							<AnnotationPage
								key={annotationPage.id}
								annotationPage={annotationPage}
							/>
						))}
					</Content>
				)}

				{pluginsWithInfoPanel &&
					pluginsWithInfoPanel.map((plugin, i) =>
						renderPluginInformationPanel(plugin, i),
					)}
			</Scroll>
		</Wrapper>
	);
};

export default InformationPanel;
