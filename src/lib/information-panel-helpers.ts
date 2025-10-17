export function hasAnyPanel({
	informationPanel,
	annotationResources,
	contentSearchResource,
	pluginsWithInfoPanel,
}) {
	return [
		informationPanel?.renderAbout,
		informationPanel?.renderAnnotation && annotationResources?.length > 0,
		informationPanel?.renderContentSearch && contentSearchResource,
		pluginsWithInfoPanel?.length > 0,
	].some(Boolean);
}

export function getAvailableTabs({
	informationPanel,
	annotationResources,
	contentSearchResource,
	pluginsWithInfoPanel,
}) {
	const tabs = [
		informationPanel?.renderAbout && "manifest-about",
		informationPanel?.renderAnnotation && annotationResources?.length > 0 && "manifest-annotations",
		informationPanel?.renderContentSearch && contentSearchResource && "manifest-content-search",
		...(pluginsWithInfoPanel?.map((p) => String(p.id)) ?? []),
	];

	// remove falsy values
	return tabs.filter(Boolean) as string[];
}
