export function hasAnyPanel({
	informationPanel,
	annotationResources,
	contentSearchResource,
	pluginsWithInfoPanel
}) {
	return (
		!!informationPanel?.renderAbout ||
		(informationPanel?.renderAnnotation && annotationResources && annotationResources.length > 0) ||
		(informationPanel?.renderContentSearch && !!contentSearchResource) ||
		(pluginsWithInfoPanel && pluginsWithInfoPanel.length > 0)
	);
}

export function getAvailableTabs({
	informationPanel,
	annotationResources,
	contentSearchResource,
	pluginsWithInfoPanel,
}) {
	const tabs: string[] = [];
	if (informationPanel?.renderAbout) tabs.push("manifest-about");
	if (informationPanel?.renderAnnotation && annotationResources && annotationResources.length > 0) tabs.push("manifest-annotations");
	if (informationPanel?.renderContentSearch && !!contentSearchResource) tabs.push("manifest-content-search");
	if (pluginsWithInfoPanel && pluginsWithInfoPanel.length > 0) {
		tabs.push(...pluginsWithInfoPanel.map((p) => String(p.id)));
	}
	return tabs;
}
