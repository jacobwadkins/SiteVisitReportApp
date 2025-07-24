import { Document, Packer, Paragraph, TextRun, Table, TableCell, TableRow, ImageRun, BorderStyle, AlignmentType, Footer, PageNumber, ShadingType, LevelFormat } from 'docx';
import { saveAs } from 'file-saver';
import { Visit } from '../types';
import { photoDB } from './indexedDB';

export const generateDOCX = async (visit: Visit, photosPerPage: 2 | 6 = 6): Promise<void> => {
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
              text: 'A. Background & Purpose',
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
              text: 'B. Notes & Observations',
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
              new TextRun({ 
                text: isTabbed ? `• ${cleanLine}` : cleanLine, 
                size: 22 
              })
            ],
            spacing: { after: 100 },
            numbering: isTabbed ? undefined : {
              reference: 'observations-numbering',
              level: 0
            },
            indent: { left: isTabbed ? 1080 : 360 } // 0.75" for bullets, 0.25" for numbers
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
              text: 'C. Recommendations & Follow-up Actions',
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
              new TextRun({ 
                text: isTabbed ? `• ${cleanLine}` : cleanLine, 
                size: 22 
              })
            ],
            spacing: { after: 100 },
            numbering: isTabbed ? undefined : {
              reference: 'recommendations-numbering',
              level: 0
            },
            indent: { left: isTabbed ? 1080 : 360 } // 0.75" for bullets, 0.25" for numbers
          })
        );
      });

      documentChildren.push(new Paragraph({ text: '', spacing: { after: 300 } }));
    }

    // Add note about photos if there are any
    if (photoData && photoData.length > 0) {
      documentChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'SEE FOLLOWING PAGES FOR PHOTOS.',
              bold: true,
              size: 24 // 12pt
            })
          ],
          spacing: { after: 600 }
        })
      );
    }

    // Photos Section
    if (photoData && photoData.length > 0) {
      if (photosPerPage === 2) {
        const totalPages = Math.ceil(photoData.length / 2);

        for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
          const startIndex = pageIndex * 2;
          const photo1 = photoData[startIndex];
          const photo2 = startIndex + 1 < photoData.length ? photoData[startIndex + 1] : null;

          // Add page break and header
          documentChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: pageIndex === 0 ? 'Site Photos' : 'Site Photos (continued)',
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

          // Create single table with 8 rows for up to 2 photos
          const tableRows = [];

          // Process first photo (rows 1-4)
          if (photo1) {
            // Row 1: First Photo
            try {
              if (!photo1.src) {
                throw new Error('Photo source not found');
              }
              const base64Data = photo1.src.split(',')[1];
              const binaryString = atob(base64Data);
              const bytes = new Uint8Array(binaryString.length);
              for (let j = 0; j < binaryString.length; j++) {
                bytes[j] = binaryString.charCodeAt(j);
              }

             // Calculate photo dimensions - max 6.5" wide or 3.5" tall
             const maxWidthInches = 6.5; // 6.5 inches
             const maxHeightInches = 3.5; // 3.5 inches
             const maxWidth = maxWidthInches * 72; // Convert to points (1 inch = 72 points)
             const maxHeight = maxHeightInches * 72; // Convert to points

             // Get actual image aspect ratio (assuming photo1.width and photo1.height exist)
             const aspectRatio = photo1.width && photo1.height ? photo1.width / photo1.height : 4 / 3; // Fallback to 4:3 if dimensions unavailable
             let photoWidth = maxWidth; // Start with max width
             let photoHeight = photoWidth / aspectRatio; // Calculate height based on aspect ratio

             // If height exceeds maxHeight, scale down to fit maxHeight
             if (photoHeight > maxHeight) {
               photoHeight = maxHeight;
               photoWidth = photoHeight * aspectRatio;
             }

              tableRows.push(
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new ImageRun({
                              data: bytes,
                              transformation: {
                               width: Math.round(photoWidth), // In points
                               height: Math.round(photoHeight) // In points
                              }
                            })
                          ],
                          alignment: AlignmentType.CENTER
                        })
                      ],
                      margins: { top: 200, bottom: 200, left: 200, right: 200 },
                      width: { size: 100, type: 'pct' }
                    })
                  ]
                })
              );
            } catch (error) {
              tableRows.push(
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `[Photo ${startIndex + 1} failed to load]`,
                              size: 20,
                              color: colors.textGray
                            })
                          ],
                          alignment: AlignmentType.CENTER
                        })
                      ],
                      margins: { top: 200, bottom: 200, left: 200, right: 200 },
                      width: { size: 100, type: 'pct' }
                    })
                  ]
                })
              );
            }

            // Row 2: First Photo Label
            const label1 = photo1.description
              ? `Photo ${startIndex + 1}: ${photo1.description}`
              : `Photo ${startIndex + 1}`;

            tableRows.push(
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: label1,
                            color: 'FFFFFF',
                            size: 24,
                            bold: true
                          })
                        ],
                        alignment: AlignmentType.CENTER
                      })
                    ],
                    shading: {
                      type: ShadingType.SOLID,
                      color: colors.navy,
                      fill: colors.navy
                    },
                    margins: { top: 100, bottom: 100, left: 200, right: 200 },
                    width: { size: 100, type: 'pct' }
                  })
                ]
              })
            );

            // Row 3: First Photo Notes
            tableRows.push(
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: photo1.notes || '',
                            size: 22, // 11pt
                            color: colors.textGray
                          })
                        ],
                        alignment: AlignmentType.LEFT
                      })
                    ],
                    margins: { top: 200, bottom: 200, left: 200, right: 200 },
                    width: { size: 100, type: 'pct' }
                  })
                ]
              })
            );

            // Row 4: Space after first photo
            tableRows.push(
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: '', spacing: { before: 0, after: 0 } })],
                    margins: { top: 0, bottom: 0, left: 200, right: 200 },
                    width: { size: 100, type: 'pct' },
                    height: { value: 40, rule: 'exact' } // 2pt height
                  })
                ]
              })
            );
          } else {
            // Push empty rows if no first photo
            for (let i = 0; i < 4; i++) {
              tableRows.push(
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ text: '', spacing: { before: 0, after: 0 } })],
                      margins: { top: 0, bottom: 0, left: 200, right: 200 },
                      width: { size: 100, type: 'pct' }
                    })
                  ]
                })
              );
            }
          }

          // Process second photo (rows 5-8)
          if (photo2) {
            // Row 5: Second Photo
            try {
              if (!photo2.src) {
                throw new Error('Photo source not found');
              }
              const base64Data = photo2.src.split(',')[1];
              const binaryString = atob(base64Data);
              const bytes = new Uint8Array(binaryString.length);
              for (let j = 0; j < binaryString.length; j++) {
                bytes[j] = binaryString.charCodeAt(j);
              }

             // Calculate photo dimensions - max 6.5" wide or 3.5" tall
             const maxWidthInches = 6.5; // 6.5 inches
             const maxHeightInches = 3.5; // 3.5 inches
             const maxWidth = maxWidthInches * 72; // Convert to points
             const maxHeight = maxHeightInches * 72; // Convert to points

             // Get actual image aspect ratio (assuming photo2.width and photo2.height exist)
             const aspectRatio = photo2.width && photo2.height ? photo2.width / photo2.height : 4 / 3; // Fallback to 4:3
             let photoWidth = maxWidth; // Start with max width
             let photoHeight = photoWidth / aspectRatio; // Calculate height

             // If height exceeds maxHeight, scale down to fit maxHeight
             if (photoHeight > maxHeight) {
               photoHeight = maxHeight;
               photoWidth = photoHeight * aspectRatio;
             }

              tableRows.push(
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new ImageRun({
                              data: bytes,
                              transformation: {
                               width: Math.round(photoWidth), // In points
                               height: Math.round(photoHeight) // In points
                              }
                            })
                          ],
                          alignment: AlignmentType.CENTER
                        })
                      ],
                      margins: { top: 200, bottom: 200, left: 200, right: 200 },
                      width: { size: 100, type: 'pct' }
                    })
                  ]
                })
              );
            } catch (error) {
              tableRows.push(
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `[Photo ${startIndex + 2} failed to load]`,
                              size: 20,
                              color: colors.textGray
                            })
                          ],
                          alignment: AlignmentType.CENTER
                        })
                      ],
                      margins: { top: 200, bottom: 200, left: 200, right: 200 },
                      width: { size: 100, type: 'pct' }
                    })
                  ]
                })
              );
            }

            // Row 6: Second Photo Label
            const label2 = photo2.description
              ? `Photo ${startIndex + 2}: ${photo2.description}`
              : `Photo ${startIndex + 2}`;

            tableRows.push(
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: label2,
                            color: 'FFFFFF',
                            size: 24,
                            bold: true
                          })
                        ],
                        alignment: AlignmentType.CENTER
                      })
                    ],
                    shading: {
                      type: ShadingType.SOLID,
                      color: colors.navy,
                      fill: colors.navy
                    },
                    margins: { top: 100, bottom: 100, left: 200, right: 200 },
                    width: { size: 80, type: 'pct' }
                  })
                ]
              })
            );

            // Row 7: Second Photo Notes
            tableRows.push(
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: photo2.notes || '',
                            size: 22, // 11pt
                            color: colors.textGray
                          })
                        ],
                        alignment: AlignmentType.LEFT
                      })
                    ],
                    margins: { top: 200, bottom: 200, left: 200, right: 200 },
                    width: { size: 100, type: 'pct' }
                  })
                ]
              })
            );

            // Row 8: Space after second photo
            tableRows.push(
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: '', spacing: { before: 0, after: 0 } })],
                    margins: { top: 0, bottom: 0, left: 200, right: 200 },
                    width: { size: 100, type: 'pct' },
                    height: { value: 40, rule: 'exact' } // 2pt height
                  })
                ]
              })
            );
          } else {
            // Push empty rows if no second photo
            for (let i = 0; i < 4; i++) {
              tableRows.push(
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ text: '', spacing: { before: 0, after: 0 } })],
                      margins: { top: 0, bottom: 0, left: 200, right: 200 },
                      width: { size: 100, type: 'pct' }
                    })
                  ]
                })
              );
            }
          }

          // Add the complete 8-row table to document
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
      } else {
        // 6 photos per page layout (existing code)
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
                      text: leftPhoto?.notes ? leftPhoto.notes.split('\n').slice(0, 3).join(' ') : '',
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
                      text: rightPhoto?.notes ? rightPhoto.notes.split('\n').slice(0, 3).join(' ') : '',
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
              margins: { top: 0, bottom: 0, left: 100, right: 100 }, // 12pt bottom margin
              width: { size: 47.5, type: 'pct' }
            }),
            new TableCell({
              children: [new Paragraph({ text: '' })],
              margins: { top: 0, bottom: 0, left: 0, right: 0 },
              width: { size: 720, type: 'dxa' }
            }),
            new TableCell({
              children: [new Paragraph({ text: '' })],
              margins: { top: 0, bottom: 0, left: 100, right: 100 }, // 12pt bottom margin
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
            reference: 'bullet-numbering',
            levels: [
              {
                level: 0,
                format: LevelFormat.BULLET,
                text: '•',
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
                                text: `Site Visit Report - ${visit.clientName} - ${visit.siteName}`,
                                size: 16, // 8pt
                                color: colors.footerGray
                              })
                            ],
                            alignment: AlignmentType.LEFT
                          })
                        ],
                        width: { size: 50, type: 'pct' },
                        margins: { top: 100, bottom: 100, left: 100, right: 100 },
                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                      }),
                      new TableCell({
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
                              })
                            ],
                            alignment: AlignmentType.RIGHT
                          })
                        ],
                        width: { size: 50, type: 'pct' },
                        margins: { top: 100, bottom: 100, left: 100, right: 100 },
                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
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
                  insideVertical: { style: BorderStyle.NONE }
                }
              })
            ]
          })
        },
        children: documentChildren
      }]
    });

        
        
    const blob = await Packer.toBlob(doc);
    const safeClientName = visit.clientName.replace(/[^a-zA-Z0-9-_]/g, '');
    const safeSiteName = visit.siteName.replace(/[^a-zA-Z0-9-_]/g, '');
    const safeDate = new Date(visit.visitDate).toISOString().split('T')[0].replace(/-/g, '');
    const fileName = `SiteVisitReport_${safeClientName}_${safeSiteName}_${safeDate}.docx`;
    saveAs(blob, fileName);
  } catch (error) {
    console.error('Error generating DOCX:', error);
    throw new Error('Failed to generate DOCX document');
  }
};