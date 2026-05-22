export function hasAnyPanel({
	informationPanel,
	annotationResources,
	contentSearchResource,
	pluginsWithInfoPanel,
	contentStateAnnotation,
	annotationCollection,
}) {
	const hasAnnotationContent =
		annotationResources?.length > 0 ||
		Boolean(contentStateAnnotation) ||
		annotationCollection?.pages?.length > 0;

	return [
		informationPanel?.renderAbout,
		informationPanel?.renderAnnotation && hasAnnotationContent,
		informationPanel?.renderContentSearch && contentSearchResource,
		pluginsWithInfoPanel?.length > 0,
	].some(Boolean);
}

export function getAvailableTabs({
	informationPanel,
	annotationResources,
	contentSearchResource,
	pluginsWithInfoPanel,
	contentStateAnnotation,
	annotationCollection,
}) {
	const hasAnnotationContent =
		annotationResources?.length > 0 ||
		Boolean(contentStateAnnotation) ||
		annotationCollection?.pages?.length > 0;

	const tabs = [
		informationPanel?.renderAbout && "manifest-about",
		informationPanel?.renderAnnotation && hasAnnotationContent && "manifest-annotations",
		informationPanel?.renderContentSearch && contentSearchResource && "manifest-content-search",
		...(pluginsWithInfoPanel?.map((p) => String(p.id)) ?? []),
	];

	// remove falsy values
	return tabs.filter(Boolean) as string[];
}
