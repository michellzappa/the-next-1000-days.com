import { visit } from 'unist-util-visit';
import { VocabData } from './getVocabData';
import { Node } from 'unist';

export function remarkVocabPlugin(vocabData: VocabData) {
  return (tree: Node) => {
    visit(tree, 'paragraph', (node: Node & { children: Node[] }) => {
      const children = node.children.flatMap((child: Node & { type: string; value?: string }) => {
        if (child.type === 'text' && child.value) {
          const parts = child.value.split(/({[^}]+})/);
          return parts.map((part: string) => {
            if (part.startsWith('{') && part.endsWith('}')) {
              const term = part.slice(1, -1);
              if (vocabData[term]) {
                const simplifiedTerm = term.split('(')[0].trim().replace(/ /g, '_');
                const imagePath = `/images/vocab/${simplifiedTerm}.webp`;
                console.log(`remarkVocabPlugin: Generated image path for term "${term}": ${imagePath}`);
                return {
                  type: 'html',
                  value: `
                    <div class="vocab-card-wrapper" data-image-path="${imagePath}">
                      <vocab-card term="${term}" definition="${vocabData[term]}">
                      </vocab-card>
                    </div>
                  `
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
