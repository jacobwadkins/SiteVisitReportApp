import { Document, Packer, Paragraph, TextRun, Table, TableCell, TableRow, ImageRun, BorderStyle, AlignmentType, Footer, PageNumber, ShadingType, LevelFormat } from 'docx';
import { saveAs } from 'file-saver';
import { Visit } from '../types';
import { photoDB } from './indexedDB';

export const generateDOCX = async (visit: Visit): Promise<void> => {
  try {
    // Load photo sources from IndexedDB
    const photoData = await photoDB.getPhotosByVisitId(visit.id);
    const photoSources: Record<string, string> = {};
    photoData.forEach(photo => {
      photoSources[photo.id] = photo.src;
    });

    // Constants for styling (matching PDF)
    const colors = {
      navy: '172554',
      lightGray: 'F5F5F5',
      borderGray: 'C8C8C8',
      textGray: '505050',
      footerGray: '808080'
    };
    const margin = 720; // 36pt = 0.5 inch
    const labelWidth = 80 * 20; // 80pt converted to twips (1pt = 20 twips)

    // Helper functions for display numbering (matching PDF logic)
    const getDisplayNumber = (index: number, isTabbed: boolean, tabbedArray: boolean[]): string => {
      if (isTabbed) return '•';
      
      let count = 1;
      for (let i = 0; i < index; i++) {
        if (!tabbedArray[i]) {
          count++;
        }
      }
      return count.toString();
    };

    const getDisplayLetter = (index: number, isTabbed: boolean, tabbedArray: boolean[]): string => {
      if (isTabbed) return '•';
      
      let count = 0;
      for (let i = 0; i < index; i++) {
        if (!tabbedArray[i]) {
          count++;
        }
      }
      return String.fromCharCode(97 + count);
    };

    // Build document children array
    const documentChildren = [];

    // Header: Title bar with company branding (2-column table)
    documentChildren.push(
      new Table({
        width: { size: 100, type: 'pct' },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: 'Site Visit Report',
                        bold: true,
                        size: 44, // 22pt
                        color: 'FFFFFF'
                      })
                    ],
                    alignment: AlignmentType.LEFT
                  })
                ],
                shading: {
                  type: ShadingType.SOLID,
                  color: colors.navy,
                  fill: colors.navy
                },
                margins: { top: 200, bottom: 200, left: 200, right: 100 },
                width: { size: 50, type: 'pct' }
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: 'Haskell',
                        size: 20, // 10pt
                        color: 'FFFFFF'
                      })
                    ],
                    alignment: AlignmentType.RIGHT
                  })
                ],
                shading: {
                  type: ShadingType.SOLID,
                  color: colors.navy,
                  fill: colors.navy
                },
                margins: { top: 200, bottom: 200, left: 100, right: 200 },
                width: { size: 50, type: 'pct' }
              })
            ]
          })
        ],
        borders: {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
          insideHorizontal: { style: BorderStyle.NONE },
          insideVertical: { style: BorderStyle.NONE },
        }
      })
    );

    // Spacing row between header and visit details
    documentChildren.push(
      new Paragraph({
        text: '',
        spacing: { after: 400 } // ~20pt spacing
      })
    );

    // Info Box: Two-column grid layout
    documentChildren.push(
      new Table({
        width: { size: 100, type: 'pct' },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: 'Client:', bold: true, size: 20 }),
                      new TextRun({ text: ' ' + visit.clientName, size: 20 })
                    ]
                  })
                ],
                shading: { 
                  type: ShadingType.SOLID,
                  color: colors.lightGray,
                  fill: colors.lightGray 
                },
                margins: { top: 100, bottom: 100, left: 200, right: 100 },
                width: { size: 50, type: 'pct' }
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: 'Date:', bold: true, size: 20 }),
                      new TextRun({ text: ' ' + new Date(visit.visitDate).toLocaleDateString(), size: 20 })
                    ]
                  })
                ],
                shading: { 
                  type: ShadingType.SOLID,
                  color: colors.lightGray,
                  fill: colors.lightGray 
                },
                margins: { top: 100, bottom: 100, left: 200, right: 100 },
                width: { size: 50, type: 'pct' }
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: 'Site:', bold: true, size: 20 }),
                      new TextRun({ text: ' ' + visit.siteName, size: 20 })
                    ]
                  })
                ],
                shading: { 
                  type: ShadingType.SOLID,
                  color: colors.lightGray,
                  fill: colors.lightGray 
                },
                margins: { top: 100, bottom: 100, left: 200, right: 100 },
                width: { size: 50, type: 'pct' }
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: 'Prepared by:', bold: true, size: 20 }),
                      new TextRun({ text: ' ' + visit.preparedBy, size: 20 })
                    ]
                  })
                ],
                shading: { 
                  type: ShadingType.SOLID,
                  color: colors.lightGray,
                  fill: colors.lightGray 
                },
                margins: { top: 100, bottom: 100, left: 200, right: 100 },
                width: { size: 50, type: 'pct' }
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: 'Project No.:', bold: true, size: 20 }),
                      new TextRun({ text: ' ' + visit.projectNo, size: 20 })
                    ]
                  })
                ],
                shading: { 
                  type: ShadingType.SOLID,
                  color: colors.lightGray,
                  fill: colors.lightGray 
                },
                margins: { top: 100, bottom: 100, left: 200, right: 100 },
                width: { size: 50, type: 'pct' }
              }),
              new TableCell({
                children: [new Paragraph({ text: '' })],
                shading: { 
                  type: ShadingType.SOLID,
                  color: colors.lightGray,
                  fill: colors.lightGray 
                },
                margins: { top: 100, bottom: 100, left: 200, right: 100 },
                width: { size: 50, type: 'pct' }
              })
            ]
          })
        ],
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1, color: colors.borderGray },
          bottom: { style: BorderStyle.SINGLE, size: 1, color: colors.borderGray },
          left: { style: BorderStyle.SINGLE, size: 1, color: colors.borderGray },
          right: { style: BorderStyle.SINGLE, size: 1, color: colors.borderGray },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: colors.borderGray },
          insideVertical: { style: BorderStyle.SINGLE, size: 1, color: colors.borderGray },
        }
      })
    );

    // Spacing after info box
    documentChildren.push(new Paragraph({ text: '', spacing: { after: 640 } }));

    // Background Section
    if (visit.background) {
      documentChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'I. Background & Purpose',
              bold: true,
              size: 28, // 14pt
              color: colors.navy
            })
          ],
          spacing: { after: 500 },
          border: {
            bottom: {
              color: colors.navy,
              space: 1,
              style: BorderStyle.SINGLE,
              size: 6,
            }
          }
        }),
        new Paragraph({
          children: [new TextRun({ text: visit.background, size: 22 })], // 11pt
          spacing: { after: 400 },
          indent: { left: 200 } // ~10pt indent
        })
      );
    }

    // Observations Section
    if (visit.observations) {
      documentChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'II. Notes & Observations',
              bold: true,
              size: 28, // 14pt
              color: colors.navy
            })
          ],
          spacing: { after: 500 },
          border: {
            bottom: {
              color: colors.navy,
              space: 1,
              style: BorderStyle.SINGLE,
              size: 6,
            }
          }
        })
      );

      const observationLines = visit.observations.split('\n').filter(line => line.trim());
      const tabbedObservations = observationLines.map(line => line.startsWith('\t') || line.startsWith('    '));

      observationLines.forEach((line, index) => {
        const cleanLine = line.replace(/^[\t\s]+/, '');
        const isTabbed = tabbedObservations[index];
        
        documentChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: cleanLine, size: 22 })
            ],
            spacing: { after: 100 },
            indent: { left: isTabbed ? 600 : 216 },
            numbering: isTabbed ? undefined : {
              reference: 'observations-numbering',
              level: 0
            }
          })
        );
      });

      documentChildren.push(new Paragraph({ text: '', spacing: { after: 300 } }));
    }

    // Follow-ups Section
    if (visit.followups) {
      documentChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'III. Recommendations & Follow-up Actions',
              bold: true,
              size: 28, // 14pt
              color: colors.navy
            })
          ],
          spacing: { after: 500 },
          border: {
            bottom: {
              color: colors.navy,
              space: 1,
              style: BorderStyle.SINGLE,
              size: 6,
            }
          }
        })
      );

      const followupLines = visit.followups.split('\n').filter(line => line.trim());
      const tabbedFollowups = followupLines.map(line => line.startsWith('\t') || line.startsWith('    '));

      followupLines.forEach((line, index) => {
        const cleanLine = line.replace(/^[\t\s]+/, '');
        const isTabbed = tabbedFollowups[index];
        
        documentChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: cleanLine, size: 22 })
            ],
            spacing: { after: 100 },
            indent: { left: isTabbed ? 600 : 216 },
            numbering: isTabbed ? undefined : {
              reference: 'recommendations-numbering',
              level: 0
            }
          })
        );
      });

      documentChildren.push(new Paragraph({ text: '', spacing: { after: 300 } }));
    }

    // Photos Section
    if (photoData && photoData.length > 0) {
      // Add page break and photos header
      documentChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Site Photos',
              bold: true,
              size: 28, // 14pt
              color: colors.navy
            })
          ],
          spacing: { after: 600 },
          pageBreakBefore: true,
          border: {
            bottom: {
              color: colors.navy,
              space: 1,
              style: BorderStyle.SINGLE,
              size: 6,
            }
          }
        })
      );

      const photosPerPage = 6;
      const totalPages = Math.ceil(photoData.length / photosPerPage);

      for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
        const startIndex = pageIndex * photosPerPage;
        
        // Add page header for subsequent photo pages
        if (pageIndex > 0) {
          documentChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Site Photos (continued)',
                  bold: true,
                  size: 28,
                  color: colors.navy
                })
              ],
              spacing: { after: 600 },
              pageBreakBefore: true,
              border: {
                bottom: {
                  color: colors.navy,
                  space: 1,
                  style: BorderStyle.SINGLE,
                  size: 6,
                }
              }
            })
          );
        }

        // Create 3 columns × 12 rows table
        const tableRows = [];

        for (let rowGroup = 0; rowGroup < 3; rowGroup++) {
          const leftPhotoIndex = startIndex + (rowGroup * 2);
          const rightPhotoIndex = startIndex + (rowGroup * 2) + 1;
          const leftPhoto = leftPhotoIndex < photoData.length ? photoData[leftPhotoIndex] : null;
          const rightPhoto = rightPhotoIndex < photoData.length ? photoData[rightPhotoIndex] : null;

          // Row 1, 5, 9: Photos
          const photoRowCells = [];
          
          // Left photo cell
          if (leftPhoto) {
            try {
              if (!leftPhoto.src) {
                throw new Error('Photo source not found');
              }
              const base64Data = leftPhoto.src.split(',')[1];
              const binaryString = atob(base64Data);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              
              photoRowCells.push(
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new ImageRun({
                          data: bytes,
                          transformation: {
                            width: 276, // 207pt * 1.33 (10% reduction)
                            height: 207 // 155pt * 1.33 (10% reduction)
                          }
                        })
                      ],
                      alignment: AlignmentType.CENTER
                    })
                  ],
                  margins: { top: 100, bottom: 100, left: 100, right: 100 },
                  width: { size: 47.5, type: 'pct' }
                })
              );
            } catch (error) {
              photoRowCells.push(
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `[Photo ${leftPhotoIndex + 1} failed to load]`,
                          size: 20,
                          color: colors.textGray
                        })
                      ],
                      alignment: AlignmentType.CENTER
                    })
                  ],
                  margins: { top: 100, bottom: 100, left: 100, right: 100 },
                  width: { size: 47.5, type: 'pct' }
                })
              );
            }
          } else {
            photoRowCells.push(
              new TableCell({
                children: [new Paragraph({ text: '' })],
                margins: { top: 100, bottom: 100, left: 100, right: 100 },
                width: { size: 47.5, type: 'pct' }
              })
            );
          }

          // Center spacing column
          photoRowCells.push(
            new TableCell({
              children: [new Paragraph({ text: '' })],
              margins: { top: 0, bottom: 0, left: 0, right: 0 },
              width: { size: 720, type: 'dxa' } // 0.5" = 720 twips
            })
          );

          // Right photo cell
          if (rightPhoto) {
            try {
              if (!rightPhoto.src) {
                throw new Error('Photo source not found');
              }
              const base64Data = rightPhoto.src.split(',')[1];
              const binaryString = atob(base64Data);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              
              photoRowCells.push(
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new ImageRun({
                          data: bytes,
                          transformation: {
                            width: 276, // 207pt * 1.33 (10% reduction)
                            height: 207 // 155pt * 1.33 (10% reduction)
                          }
                        })
                      ],
                      alignment: AlignmentType.CENTER
                    })
                  ],
                  margins: { top: 100, bottom: 100, left: 100, right: 100 },
                  width: { size: 47.5, type: 'pct' }
                })
              );
            } catch (error) {
              photoRowCells.push(
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `[Photo ${rightPhotoIndex + 1} failed to load]`,
                          size: 20,
                          color: colors.textGray
                        })
                      ],
                      alignment: AlignmentType.CENTER
                    })
                  ],
                  margins: { top: 100, bottom: 100, left: 100, right: 100 },
                  width: { size: 47.5, type: 'pct' }
                })
              );
            }
          } else {
            photoRowCells.push(
              new TableCell({
                children: [new Paragraph({ text: '' })],
                margins: { top: 100, bottom: 100, left: 100, right: 100 },
                width: { size: 47.5, type: 'pct' }
              })
            );
          }

          tableRows.push(new TableRow({ children: photoRowCells }));

          // Row 2, 6, 10: Captions with navy background
          const captionRowCells = [];
          
          // Left caption
          const leftLabel = leftPhoto ? (leftPhoto.description 
            ? `Photo ${leftPhotoIndex + 1}: ${leftPhoto.description.substring(0, 35)}${leftPhoto.description.length > 35 ? '...' : ''}`
            : `Photo ${leftPhotoIndex + 1}`) : '';
          
          captionRowCells.push(
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: leftLabel,
                      color: 'FFFFFF',
                      size: 20,
                      bold: true
                    })
                  ],
                  alignment: AlignmentType.CENTER
                })
              ],
              shading: leftPhoto ? { 
                type: ShadingType.SOLID, 
                color: colors.navy, 
                fill: colors.navy 
              } : undefined,
              margins: { top: 100, bottom: 100, left: 100, right: 100 },
              width: { size: 47.5, type: 'pct' }
            })
          );

          // Center spacing
          captionRowCells.push(
            new TableCell({
              children: [new Paragraph({ text: '' })],
              margins: { top: 0, bottom: 0, left: 0, right: 0 },
              width: { size: 720, type: 'dxa' }
            })
          );

          // Right caption
          const rightLabel = rightPhoto ? (rightPhoto.description 
            ? `Photo ${rightPhotoIndex + 1}: ${rightPhoto.description.substring(0, 35)}${rightPhoto.description.length > 35 ? '...' : ''}`
            : `Photo ${rightPhotoIndex + 1}`) : '';
          
          captionRowCells.push(
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: rightLabel,
                      color: 'FFFFFF',
                      size: 20,
                      bold: true
                    })
                  ],
                  alignment: AlignmentType.CENTER
                })
              ],
              shading: rightPhoto ? { 
                type: ShadingType.SOLID, 
                color: colors.navy, 
                fill: colors.navy 
              } : undefined,
              margins: { top: 100, bottom: 100, left: 100, right: 100 },
              width: { size: 47.5, type: 'pct' }
            })
          );

          tableRows.push(new TableRow({ children: captionRowCells }));

          // Row 3, 7, 11: Notes
          const notesRowCells = [];
          
          notesRowCells.push(
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: leftPhoto?.notes ? leftPhoto.notes.split('\n').slice(0, 2).join(' ') : '',
                      size: 18, // 9pt
                      color: colors.textGray
                    })
                  ],
                  alignment: AlignmentType.CENTER
                })
              ],
              margins: { top: 100, bottom: 100, left: 100, right: 100 },
              width: { size: 47.5, type: 'pct' }
            })
          );

          // Center spacing
          notesRowCells.push(
            new TableCell({
              children: [new Paragraph({ text: '' })],
              margins: { top: 0, bottom: 0, left: 0, right: 0 },
              width: { size: 720, type: 'dxa' }
            })
          );

          notesRowCells.push(
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: rightPhoto?.notes ? rightPhoto.notes.split('\n').slice(0, 2).join(' ') : '',
                      size: 18, // 9pt
                      color: colors.textGray
                    })
                  ],
                  alignment: AlignmentType.CENTER
                })
              ],
              margins: { top: 100, bottom: 100, left: 100, right: 100 },
              width: { size: 47.5, type: 'pct' }
            })
          );

          tableRows.push(new TableRow({ children: notesRowCells }));

          // Row 4, 8, 12: Blank spacing
          const spacingRowCells = [
            new TableCell({
              children: [new Paragraph({ text: '' })],
              margins: { top: 100, bottom: 240, left: 100, right: 100 }, // 12pt bottom margin
              width: { size: 47.5, type: 'pct' }
            }),
            new TableCell({
              children: [new Paragraph({ text: '' })],
              margins: { top: 0, bottom: 0, left: 0, right: 0 },
              width: { size: 720, type: 'dxa' }
            }),
            new TableCell({
              children: [new Paragraph({ text: '' })],
              margins: { top: 100, bottom: 240, left: 100, right: 100 }, // 12pt bottom margin
              width: { size: 47.5, type: 'pct' }
            })
          ];

          tableRows.push(new TableRow({ children: spacingRowCells }));
        }

        // Add the complete table to document
        documentChildren.push(
          new Table({
            width: { size: 100, type: 'pct' },
            rows: tableRows,
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE },
              insideVertical: { style: BorderStyle.NONE },
            }
          })
        );
      }
    }

    const doc = new Document({
      numbering: {
        config: [
          {
            reference: 'observations-numbering',
            levels: [
              {
                level: 0,
                format: LevelFormat.DECIMAL,
                text: '%1.',
                alignment: AlignmentType.START,
                style: {
                  paragraph: {
                    indent: { left: 360, hanging: 360 }
                  },
                  run: {
                    size: 22
                  }
                }
              }
            ]
          },
          {
            reference: 'recommendations-numbering',
            levels: [
              {
                level: 0,
                format: LevelFormat.LOWER_LETTER,
                text: '%1.',
                alignment: AlignmentType.START,
                style: {
                  paragraph: {
                    indent: { left: 360, hanging: 360 }
                  },
                  run: {
                    size: 22
                  }
                }
              }
            ]
          }
        ]
      },
      sections: [{
        properties: {
          page: {
            margin: {
              top: margin,
              right: margin,
              bottom: margin,
              left: margin,
            },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Page ',
                    size: 16, // 8pt
                    color: colors.footerGray
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 16,
                    color: colors.footerGray
                  }),
                  new TextRun({
                    text: ' of ',
                    size: 16,
                    color: colors.footerGray
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 16,
                    color: colors.footerGray
                  }),
                  new TextRun({
                    text: '\t\t\t\t\t\t\t\t\t\tHaskell',
                    size: 16,
                    color: colors.footerGray
                  })
                ],
                alignment: AlignmentType.LEFT,
              })
            ]
          })
        },
        children: documentChildren
      }]
    });

    const blob = await Packer.toBlob(doc);
    const safeSiteName = visit.siteName.replace(/[^a-zA-Z0-9-_]/g, '');
    const safeDate = new Date(visit.visitDate).toISOString().split('T')[0].replace(/-/g, '');
    const fileName = `Site_Visit_Report_${safeSiteName}_${safeDate}.docx`;
    saveAs(blob, fileName);
  } catch (error) {
    console.error('Error generating DOCX:', error);
    throw new Error('Failed to generate DOCX document');
  }
};