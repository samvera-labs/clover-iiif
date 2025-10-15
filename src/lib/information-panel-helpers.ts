export function hasAnyPanel({
	renderAbout,
	renderAnnotation,
	renderContentSearch,
	pluginsWithInfoPanel,
	annotationResources,
	contentSearchResource,
}) {
	return (
		!!renderAbout ||
		(renderAnnotation && annotationResources && annotationResources.length > 0) ||
		(renderContentSearch && !!contentSearchResource) ||
		(pluginsWithInfoPanel && pluginsWithInfoPanel.length > 0)
	);
}

export function getAvailableTabs({
	renderAbout,
	renderAnnotation,
	renderContentSearch,
	pluginsWithInfoPanel,
	annotationResources,
	contentSearchResource,
}) {
	const tabs: string[] = [];
	if (renderAbout) tabs.push("manifest-about");
	if (renderAnnotation && annotationResources && annotationResources.length > 0) tabs.push("manifest-annotations");
	if (renderContentSearch && !!contentSearchResource) tabs.push("manifest-content-search");
	if (pluginsWithInfoPanel && pluginsWithInfoPanel.length > 0) {
		tabs.push(...pluginsWithInfoPanel.map((p) => String(p.id)));
	}
	return tabs;
}
