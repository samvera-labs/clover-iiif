import { render, screen } from "@testing-library/react";
import PropertiesRange from "src/components/Viewer/Properties/Range";
import React from "react";

const json = [
        {
            "id": "https://iiif.io/api/cookbook/recipe/0026-toc-opera/range/2",
            "type": "Range",
            "label": {
            "it": [
                "Atto Primo"
            ]
            },
            "untitled": false,
            "isCanvasLeaf": false,
            "isRangeLeaf": false,
            "items": [
            {
                "id": "https://iiif.io/api/cookbook/recipe/0026-toc-opera/range/3",
                "type": "Range",
                "label": {
                "it": [
                    "Preludio e Coro d'introduzione – Bel conforto al mietitore"
                ]
                },
                "untitled": false,
                "isCanvasLeaf": false,
                "isRangeLeaf": true,
                "items": [
                {
                    "id": "https://iiif.io/api/cookbook/recipe/0026-toc-opera/canvas/1#t=0,302.05",
                    "type": "Canvas",
                    "isCanvasLeaf": true,
                    "isRangeLeaf": false,
                    "label": {
                    "none": [
                        "Untitled"
                    ]
                    },
                    "untitled": true,
                    "resource": {
                    "type": "SpecificResource",
                    "source": {
                        "id": "https://iiif.io/api/cookbook/recipe/0026-toc-opera/canvas/1",
                        "type": "Canvas"
                    },
                    "selector": {
                        "type": "FragmentSelector",
                        "value": "t=0,302.05"
                    }
                    }
                }
                ],
                "firstCanvas": {
                "type": "SpecificResource",
                "source": {
                    "id": "https://iiif.io/api/cookbook/recipe/0026-toc-opera/canvas/1",
                    "type": "Canvas"
                },
                "selector": {
                    "type": "FragmentSelector",
                    "value": "t=0,302.05"
                }
                }
            },
            {
                "id": "https://iiif.io/api/cookbook/recipe/0026-toc-opera/range/4",
                "type": "Range",
                "label": {
                "en": [
                    "Remainder of Atto Primo"
                ]
                },
                "untitled": false,
                "isCanvasLeaf": false,
                "isRangeLeaf": true,
                "items": [
                {
                    "id": "https://iiif.io/api/cookbook/recipe/0026-toc-opera/canvas/1#t=302.05,3971.24",
                    "type": "Canvas",
                    "isCanvasLeaf": true,
                    "isRangeLeaf": false,
                    "label": {
                    "none": [
                        "Untitled"
                    ]
                    },
                    "untitled": true,
                    "resource": {
                    "type": "SpecificResource",
                    "source": {
                        "id": "https://iiif.io/api/cookbook/recipe/0026-toc-opera/canvas/1",
                        "type": "Canvas"
                    },
                    "selector": {
                        "type": "FragmentSelector",
                        "value": "t=302.05,3971.24"
                    }
                    }
                }
                ],
                "firstCanvas": {
                "type": "SpecificResource",
                "source": {
                    "id": "https://iiif.io/api/cookbook/recipe/0026-toc-opera/canvas/1",
                    "type": "Canvas"
                },
                "selector": {
                    "type": "FragmentSelector",
                    "value": "t=302.05,3971.24"
                }
                }
            }
            ],
            "firstCanvas": {
            "type": "SpecificResource",
            "source": {
                "id": "https://iiif.io/api/cookbook/recipe/0026-toc-opera/canvas/1",
                "type": "Canvas"
            },
            "selector": {
                "type": "FragmentSelector",
                "value": "t=0,302.05"
            }
            }
        },
        {
            "id": "https://iiif.io/api/cookbook/recipe/0026-toc-opera/range/5",
            "type": "Range",
            "label": {
            "it": [
                "Atto Secondo"
            ]
            },
            "untitled": false,
            "isCanvasLeaf": false,
            "isRangeLeaf": true,
            "items": [
            {
                "id": "https://iiif.io/api/cookbook/recipe/0026-toc-opera/canvas/1#t=3971.24",
                "type": "Canvas",
                "isCanvasLeaf": true,
                "isRangeLeaf": false,
                "label": {
                "none": [
                    "Untitled"
                ]
                },
                "untitled": true,
                "resource": {
                "type": "SpecificResource",
                "source": {
                    "id": "https://iiif.io/api/cookbook/recipe/0026-toc-opera/canvas/1",
                    "type": "Canvas"
                },
                "selector": {
                    "type": "FragmentSelector",
                    "value": "t=3971.24"
                }
                }
            }
            ],
            "firstCanvas": {
            "type": "SpecificResource",
            "source": {
                "id": "https://iiif.io/api/cookbook/recipe/0026-toc-opera/canvas/1",
                "type": "Canvas"
            },
            "selector": {
                "type": "FragmentSelector",
                "value": "t=3971.24"
            }
            }
        }
    ];

describe("IIIF Range component", () => {
  it("renders", () => {
    render(<PropertiesRange items={json} />);

    /**
     * test anchors
     */
    const links = screen.queryAllByRole('link');

    expect(links).toHaveLength(3);
  });
});