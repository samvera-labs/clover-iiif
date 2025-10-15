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
