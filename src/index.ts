const setupSwaggerCustomization = () => {
  setTimeout(() => {
    const API = JSON.parse((window as any).ui.spec()._root.entries[0][1]);
    const API_OPERATIONS = {
      paths: API.paths as { [key: string]: any },
      schemas: API.components.schemas as { [key: string]: any },
    };

    const COLORS = [
      'green',
      'blue',
      '#E3651D',
      '#750E21',
      '#03C4A1',
      '#008170',
      '#610C9F',
      '#DA0C81',
      '#B0A565',
      'black',
    ];

    type TOperation = {
      operationId: string;
      path: string;
      type: string;
      color: string;
      tags: string[];
      summary: string;
      [key: string]: any;
    };

    const mountSelector = () => {
      const topBarWrapper = window.document.querySelector('.topbar-wrapper');

      const label = window.document.createElement('label');
      label.innerText = 'API version';
      label.style.fontSize = '20px';
      label.style.color = 'white';
      label.style.margin = '0 10px 0 40vw';

      const apiVersionSelector = window.document.createElement('select');
      apiVersionSelector.id = 'version-selector';
      apiVersionSelector.style.cursor = 'pointer';
      Object.keys((this as any).versions).forEach((version) => {
        const option = window.document.createElement('option');
        option.value = version;
        option.textContent = version;
        apiVersionSelector.appendChild(option);
      });
      const initialValue =
        localStorage.getItem('apiVersion') ||
        Object.keys((this as any).defaultVersion)[0];
      apiVersionSelector.value = initialValue;

      apiVersionSelector.addEventListener('change', () => {
        const sections = window.document.getElementsByClassName(
          'opblock-tag-section is-open'
        );
        for (const section of sections) {
          filterSectionOperations(section);
        }
        localStorage.setItem('apiVersion', apiVersionSelector.value);
      });

      topBarWrapper?.appendChild(label);
      topBarWrapper?.appendChild(apiVersionSelector);
    };

    const shouldHideOperation = (operationId: string, apiVersion: string) => {
      return (
        !operationId.includes((this as any).versions[apiVersion]) &&
        !operationId.includes('Neutral')
      );
    };

    const filterSectionOperations = (section: Element) => {
      const apiVersionSelector = window.document.getElementById(
        'version-selector'
      ) as HTMLSelectElement;
      const operations = section.getElementsByClassName('opblock');

      for (const operation of operations) {
        if (shouldHideOperation(operation.id, apiVersionSelector.value)) {
          (operation as HTMLElement).hidden = true;
        } else {
          (operation as HTMLElement).hidden = false;
        }
      }
    };

    const handleSection = (section: Element) => {
      if (!section.classList.contains('is-open')) {
        const sectionObserver = new MutationObserver(() => {
          sectionObserver.disconnect();

          filterSectionOperations(section);
          tagSectionOperations(section);
        });

        sectionObserver.observe(section, { childList: true, subtree: true });
      }
    };

    const extractOperationVersion = (operationId: string) => {
      const versionRegex = /Controller([A-Za-z0-9]+)_/;
      const version = (operationId.match(versionRegex) as RegExpMatchArray)[1];
      const operationIdWithoutVersion = operationId.replace(
        `Controller${version}_`,
        'Controller_'
      );
      return { operationIdWithoutVersion, version };
    };

    const groupOperationsById = (operations: TOperation[]) => {
      return operations.reduce((acc, operation) => {
        const { operationIdWithoutVersion: id } = extractOperationVersion(
          operation.operationId
        );
        if (!acc[id]) {
          acc[id] = [];
        }
        acc[id].push(operation);
        return acc;
      }, {} as Record<string, TOperation[]>);
    };

    const deepEqual = (obj1: any, obj2: any) => {
      if (obj1 === obj2) {
        return true;
      }

      if (
        obj1 == null ||
        obj2 == null ||
        typeof obj1 !== 'object' ||
        typeof obj2 !== 'object'
      ) {
        return false;
      }

      const keys1 = Object.keys(obj1);
      const keys2 = Object.keys(obj2);

      if (keys1.length !== keys2.length) {
        return false;
      }

      for (const key of keys1) {
        if (key === '$ref') {
          const refValue1 = obj1[key];
          const refValue2 = obj2[key];

          const trimmedRef1 = refValue1.substring(
            refValue1.lastIndexOf('/') + 1
          );
          const trimmedRef2 = refValue2.substring(
            refValue2.lastIndexOf('/') + 1
          );

          const schema1 = API_OPERATIONS.schemas[trimmedRef1];
          const schema2 = API_OPERATIONS.schemas[trimmedRef2];

          if (!deepEqual(schema1, schema2)) {
            return false;
          }
        } else if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
          return false;
        }
      }

      return true;
    };

    const tagSectionOperations = (section: Element) => {
      const operations = Object.entries(API_OPERATIONS.paths)
        .flatMap(([path, operations]) =>
          Object.entries(operations).map(([type, operation]) => ({
            ...(operation as TOperation),
            path,
            type,
          }))
        )
        .filter((operation) => {
          const tag = section.querySelector('h3')?.getAttribute('data-tag');
          return tag && operation.tags.includes(tag);
        });

      const groupedOperations = groupOperationsById(operations);

      Object.values(groupedOperations).forEach((group) => {
        let colorIndex = 0;
        group[0].color = COLORS[colorIndex];
        const excludedKeys = ['operationId', 'color', 'path'];

        for (let i = 1; i < group.length; i++) {
          const prevOperation = Object.fromEntries(
            Object.entries(group[i - 1]).filter(
              ([key]) => !excludedKeys.includes(key)
            )
          );

          const currOperation = Object.fromEntries(
            Object.entries(group[i]).filter(
              ([key]) => !excludedKeys.includes(key)
            )
          );

          if (!deepEqual(prevOperation, currOperation)) {
            colorIndex++;
          }
          group[i].color = COLORS[colorIndex];
        }
      });

      Object.values(groupedOperations).forEach((group) => {
        group.forEach((operation) => {
          const operationElem = Array.from(
            section.querySelectorAll('.opblock')
          ).find(
            (opblock) =>
              opblock.querySelector(`span[data-path="${operation.path}"]`) &&
              Array.from(opblock.querySelectorAll('span')).some(
                (span) => span.textContent === operation.type.toUpperCase()
              )
          );

          const versionsDiv = window.document.createElement('div');
          versionsDiv.style.display = 'flex';
          versionsDiv.style.gap = '3px';
          versionsDiv.style.margin = '0 20px';
          versionsDiv.style.fontSize = '14px';

          group.forEach((operation) => {
            const span = window.document.createElement('span');
            span.textContent = extractOperationVersion(
              operation.operationId
            ).version;
            span.style.fontSize = '14px';
            span.style.color = operation.color;
            versionsDiv.appendChild(span);
          });

          const parentNode = operationElem?.querySelector('.opblock-summary');
          const childNode = parentNode?.querySelector('.view-line-link');
          if (childNode) parentNode?.insertBefore(versionsDiv, childNode);
        });
      });
    };

    const expandSpoilers = () => {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              (node as Element)
                .querySelectorAll('button.model-box-control')
                .forEach((btn) => {
                  if (btn.getAttribute('aria-expanded') === 'false') {
                    (btn as HTMLElement).click();
                  }
                });
            }
          });
        });
      });

      observer.observe(window.document.body, {
        childList: true,
        subtree: true,
      });
    };

    (() => {
      mountSelector();

      const openedSection = window.document.querySelector(
        '.opblock-tag-section.is-open'
      );
      if (openedSection) {
        filterSectionOperations(openedSection);
        tagSectionOperations(openedSection);
      }

      const sectionsHeaders =
        window.document.getElementsByClassName('opblock-tag');
      for (const header of sectionsHeaders) {
        header.addEventListener('click', () =>
          handleSection(header.parentElement as HTMLElement)
        );
      }

      expandSpoilers();
    })();
  });
};

export default setupSwaggerCustomization;
