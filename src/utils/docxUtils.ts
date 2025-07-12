import { Document, Packer, Paragraph, TextRun, Table, TableCell, TableRow, ImageRun, BorderStyle, AlignmentType, Footer, PageNumber, ShadingType } from 'docx';
import { saveAs } from 'file-saver';
import { Visit } from '../types';

export const generateDOCX = async (visit: Visit): Promise<void> => {
  try {
    // Constants for styling (matching PDF)
    const colors = {
      navy: '172554',
      lightGray: 'F5F5F5',
      borderGray: 'C8C8C8',
      textGray: '505050',
      footerGray: '808080'
    };
    const margin = 720; // 36pt = 0.5 inch

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

    const doc = new Document({
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
                    size: 16,
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
        children: [
          // Header: Title bar with company branding
          new Paragraph({
            children: [
              new TextRun({
                text: 'Site Visit Report\t\t\t\t\t\t\t\t\t\tHaskell',
                bold: true,
                size: 44,
                color: 'FFFFFF'
              })
            ],
            shading: {
              type: ShadingType.SOLID,
              color: colors.navy,
              fill: colors.navy
            },
            spacing: { after: 400 },
          }),

          // Info Box: Table layout
          new Table({
            width: { size: 100, type: 'pct' },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Client: ', bold: true, size: 20 }),
                          new TextRun({ text: visit.clientName, size: 20 })
                        ]
                      })
                    ],
                    shading: { fill: colors.lightGray },
                    margins: { top: 100, bottom: 100, left: 200, right: 100 },
                    width: { size: 50, type: 'pct' }
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Date: ', bold: true, size: 20 }),
                          new TextRun({ text: new Date(visit.visitDate).toLocaleDateString(), size: 20 })
                        ]
                      })
                    ],
                    shading: { fill: colors.lightGray },
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
                          new TextRun({ text: 'Site: ', bold: true, size: 20 }),
                          new TextRun({ text: visit.siteName, size: 20 })
                        ]
                      })
                    ],
                    shading: { fill: colors.lightGray },
                    margins: { top: 100, bottom: 100, left: 200, right: 100 },
                    width: { size: 50, type: 'pct' }
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Prepared by: ', bold: true, size: 20 }),
                          new TextRun({ text: visit.preparedBy, size: 20 })
                        ]
                      })
                    ],
                    shading: { fill: colors.lightGray },
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
                          new TextRun({ text: 'Project No.: ', bold: true, size: 20 }),
                          new TextRun({ text: visit.projectNo, size: 20 })
                        ]
                      })
                    ],
                    shading: { fill: colors.lightGray },
                    margins: { top: 100, bottom: 100, left: 200, right: 100 },
                    width: { size: 50, type: 'pct' }
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: '' })],
                    shading: { fill: colors.lightGray },
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
          }),

          new Paragraph({ text: '', spacing: { after: 640 } }),

          // Background Section
          ...(visit.background ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: '1. Background & Purpose',
                  bold: true,
                  size: 28,
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
              children: [new TextRun({ text: visit.background, size: 22 })],
              spacing: { after: 400 },
              indent: { left: 200 }
            })
          ] : []),

          // Observations Section
          ...(visit.observations ? (() => {
            const lines = visit.observations.split('\n').filter(line => line.trim());
            const tabbedObservations = lines.map(line => line.startsWith('\t') || line.startsWith('    '));
            
            return [
              new Paragraph({
                children: [
                  new TextRun({
                    text: '2. Site Observations',
                    bold: true,
                    size: 28,
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
              ...lines.map((line, index) => {
                const cleanLine = line.replace(/^[\t\s]+/, '');
                const isTabbed = tabbedObservations[index];
                const displayNumber = getDisplayNumber(index, isTabbed, tabbedObservations);
                
                return new Paragraph({
                  children: [
                    new TextRun({ text: `${displayNumber}${isTabbed ? '' : '.'} `, size: 22 }),
                    new TextRun({ text: cleanLine, size: 22 })
                  ],
                  spacing: { after: 100 },
                  indent: { left: isTabbed ? 600 : 200 }
                });
              }),
              new Paragraph({ text: '', spacing: { after: 300 } })
            ];
          })() : []),

          // Follow-ups Section
          ...(visit.followups ? (() => {
            const lines = visit.followups.split('\n').filter(line => line.trim());
            const tabbedFollowups = lines.map(line => line.startsWith('\t') || line.startsWith('    '));
            
            return [
              new Paragraph({
                children: [
                  new TextRun({
                    text: '3. Recommendations & Follow-up Actions',
                    bold: true,
                    size: 28,
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
              ...lines.map((line, index) => {
                const cleanLine = line.replace(/^[\t\s]+/, '');
                const isTabbed = tabbedFollowups[index];
                const displayLetter = getDisplayLetter(index, isTabbed, tabbedFollowups);
                
                return new Paragraph({
                  children: [
                    new TextRun({ text: `${displayLetter}${isTabbed ? '' : '.'} `, size: 22 }),
                    new TextRun({ text: cleanLine, size: 22 })
                  ],
                  spacing: { after: 100 },
                  indent: { left: isTabbed ? 600 : 200 }
                });
              }),
              new Paragraph({ text: '', spacing: { after: 300 } })
            ];
          })() : []),

          // Photos Section
          ...(visit.photos && visit.photos.length > 0 ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Site Photos',
                  bold: true,
                  size: 28,
                  color: colors.navy
                })
              ],
              spacing: { after: 500 },
              pageBreakBefore: true,
              border: {
                bottom: {
                  color: colors.navy,
                  space: 1,
                  style: BorderStyle.SINGLE,
                  size: 6,
                }
              }
            }),
            // Create photo tables - 6 photos per page in 2x12 table structure
            ...(() => {
              const photoTables = [];
              const photosPerPage = 6;
              
              for (let pageIndex = 0; pageIndex < Math.ceil(visit.photos.length / photosPerPage); pageIndex++) {
                const startIndex = pageIndex * photosPerPage;
                const photosOnPage = visit.photos.slice(startIndex, startIndex + photosPerPage);
                
                // Add page header for subsequent photo pages
                if (pageIndex > 0) {
                  photoTables.push(
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: 'Site Photos (continued)',
                          bold: true,
                          size: 28,
                          color: colors.navy
                        })
                      ],
                      spacing: { after: 500 },
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
                
                // Create 2x12 table for this page
                const tableRows = [];
                
                for (let rowGroup = 0; rowGroup < 3; rowGroup++) { // 3 groups of 4 rows each
                  const leftPhotoIndex = startIndex + (rowGroup * 2);
                  const rightPhotoIndex = startIndex + (rowGroup * 2) + 1;
                  const leftPhoto = leftPhotoIndex < visit.photos.length ? visit.photos[leftPhotoIndex] : null;
                  const rightPhoto = rightPhotoIndex < visit.photos.length ? visit.photos[rightPhotoIndex] : null;
                  
                  // Row 1, 5, 9: Photos
                  const photoRow = new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          leftPhoto ? (() => {
                            try {
                              const base64Data = leftPhoto.src.split(',')[1];
                              const binaryString = atob(base64Data);
                              const bytes = new Uint8Array(binaryString.length);
                              for (let i = 0; i < binaryString.length; i++) {
                                bytes[i] = binaryString.charCodeAt(i);
                              }
                              return new Paragraph({
                                children: [
                                  new ImageRun({
                                    data: bytes,
                                    transformation: {
                                      width: 230 * 1.33, // 230pt converted to EMU
                                      height: 172 * 1.33  // 172pt converted to EMU
                                    }
                                  })
                                ],
                                alignment: AlignmentType.CENTER
                              });
                            } catch (error) {
                              return new Paragraph({
                                children: [
                                  new TextRun({
                                    text: `[Photo ${leftPhotoIndex + 1} failed to load]`,
                                    size: 20,
                                    color: colors.textGray
                                  })
                                ],
                                alignment: AlignmentType.CENTER
                              });
                            }
                          })() : new Paragraph({ text: '' })
                        ],
                        margins: { top: 100, bottom: 100, left: 100, right: 100 },
                        width: { size: 50, type: 'pct' }
                      }),
                      new TableCell({
                        children: [
                          rightPhoto ? (() => {
                            try {
                              const base64Data = rightPhoto.src.split(',')[1];
                              const binaryString = atob(base64Data);
                              const bytes = new Uint8Array(binaryString.length);
                              for (let i = 0; i < binaryString.length; i++) {
                                bytes[i] = binaryString.charCodeAt(i);
                              }
                              return new Paragraph({
                                children: [
                                  new ImageRun({
                                    data: bytes,
                                    transformation: {
                                      width: 230 * 1.33, // 230pt converted to EMU
                                      height: 172 * 1.33  // 172pt converted to EMU
                                    }
                                  })
                                ],
                                alignment: AlignmentType.CENTER
                              });
                            } catch (error) {
                              return new Paragraph({
                                children: [
                                  new TextRun({
                                    text: `[Photo ${rightPhotoIndex + 1} failed to load]`,
                                    size: 20,
                                    color: colors.textGray
                                  })
                                ],
                                alignment: AlignmentType.CENTER
                              });
                            }
                          })() : new Paragraph({ text: '' })
                        ],
                        margins: { top: 100, bottom: 100, left: 100, right: 100 },
                        width: { size: 50, type: 'pct' }
                      })
                    ]
                  });
                  
                  // Row 2, 6, 10: Captions with navy background
                  const captionRow = new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: leftPhoto ? (leftPhoto.description 
                                  ? `Photo ${leftPhotoIndex + 1}: ${leftPhoto.description.substring(0, 35)}${leftPhoto.description.length > 35 ? '...' : ''}`
                                  : `Photo ${leftPhotoIndex + 1}`) : '',
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
                        width: { size: 50, type: 'pct' }
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: rightPhoto ? (rightPhoto.description 
                                  ? `Photo ${rightPhotoIndex + 1}: ${rightPhoto.description.substring(0, 35)}${rightPhoto.description.length > 35 ? '...' : ''}`
                                  : `Photo ${rightPhotoIndex + 1}`) : '',
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
                        width: { size: 50, type: 'pct' }
                      })
                    ]
                  });
                  
                  // Row 3, 7, 11: Notes in gray text
                  const notesRow = new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: leftPhoto?.notes ? leftPhoto.notes.split('\n').slice(0, 2).join(' ') : '',
                                size: 18,
                                color: colors.textGray
                              })
                            ],
                            alignment: AlignmentType.CENTER
                          })
                        ],
                        margins: { top: 100, bottom: 100, left: 100, right: 100 },
                        width: { size: 50, type: 'pct' }
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: rightPhoto?.notes ? rightPhoto.notes.split('\n').slice(0, 2).join(' ') : '',
                                size: 18,
                                color: colors.textGray
                              })
                            ],
                            alignment: AlignmentType.CENTER
                          })
                        ],
                        margins: { top: 100, bottom: 100, left: 100, right: 100 },
                        width: { size: 50, type: 'pct' }
                      })
                    ]
                  });
                  
                  // Row 4, 8, 12: Blank spacing rows
                  const spacingRow = new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph({ text: '' })],
                        margins: { top: 100, bottom: 240, left: 100, right: 100 }, // 12pt bottom margin
                        width: { size: 50, type: 'pct' }
                      }),
                      new TableCell({
                        children: [new Paragraph({ text: '' })],
                        margins: { top: 100, bottom: 240, left: 100, right: 100 }, // 12pt bottom margin
                        width: { size: 50, type: 'pct' }
                      })
                    ]
                  });
                  
                  // Add all 4 rows for this group
                  tableRows.push(photoRow, captionRow, notesRow, spacingRow);
                }
                
                // Create the table with all 12 rows
                photoTables.push(
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
              
              return photoTables;
            })()
          ] : [])
        ]
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