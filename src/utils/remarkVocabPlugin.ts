import { visit } from 'unist-util-visit';
import { VocabData } from './getVocabData';

export function remarkVocabPlugin(vocabData: VocabData) {
  return (tree: any) => {
    visit(tree, 'paragraph', (node, index, parent) => {
      const children = node.children.flatMap((child: any) => {
        if (child.type === 'text') {
          const parts = child.value.split(/({[^}]+})/);
          return parts.map((part: string) => {
            if (part.startsWith('{') && part.endsWith('}')) {
              const term = part.slice(1, -1);
              if (vocabData[term]) {
                return {
                  type: 'html',
                  value: `<div class="vocab-card-wrapper"><vocab-card term="${term}" definition="${vocabData[term]}"></vocab-card></div>`
                };
              }
            }
            return { type: 'text', value: part };
          });
        }
        return child;
      });

      node.children = children;
    });
  };
}
