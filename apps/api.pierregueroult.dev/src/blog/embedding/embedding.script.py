#!/Users/pierregueroult/Developpement/personal-website-and-stuff/.venv/bin/python
# apps/backend/scripts/embeddings.py

import json
import sys
import logging
from sentence_transformers import SentenceTransformer
import numpy as np

# Configuration du logging
logging.basicConfig(level=logging.ERROR, stream=sys.stderr)

class EmbeddingGenerator:
    def __init__(self, model_name='all-MiniLM-L6-v2'):
        """
        Initialise le générateur d'embeddings.
        all-MiniLM-L6-v2 : 384 dimensions, rapide, bon équilibre qualité/performance
        Alternative: 'all-mpnet-base-v2' (768 dim, plus lent mais meilleur)
        """
        try:
            self.model = SentenceTransformer(model_name)
        except Exception as e:
            logging.error(f"Failed to load model {model_name}: {e}")
            sys.exit(1)
    
    def generate_embedding(self, text):
        """Génère un embedding pour un texte donné."""
        try:
            # Nettoyer et préprocesser le texte
            text = self.preprocess_text(text)
            
            # Générer l'embedding
            embedding = self.model.encode(text, convert_to_tensor=False)
            
            # Convertir en liste Python pour la sérialisation JSON
            return embedding.tolist()
            
        except Exception as e:
            logging.error(f"Error generating embedding: {e}")
            return None
    
    def preprocess_text(self, text):
        """Préprocesse le texte avant génération d'embedding."""
        if not text or not text.strip():
            return ""
        
        # Limiter la longueur (les modèles ont des limites de tokens)
        # Sentence-BERT supporte généralement jusqu'à 512 tokens
        max_chars = 2000  # Approximation conservative
        if len(text) > max_chars:
            text = text[:max_chars] + "..."
        
        # Nettoyer les caractères de contrôle
        text = ''.join(char for char in text if ord(char) >= 32 or char in '\n\t')
        
        return text.strip()

def main():
    try:
        # Lire l'input depuis stdin
        input_data = sys.stdin.read()
        
        if not input_data:
            raise ValueError("No input provided")
        
        # Parser le JSON
        request = json.loads(input_data)
        text = request.get('text', '')
        
        if not text:
            raise ValueError("No text provided in request")
        
        # Initialiser le générateur
        generator = EmbeddingGenerator()
        
        # Générer l'embedding
        embedding = generator.generate_embedding(text)
        
        if embedding is None:
            raise RuntimeError("Failed to generate embedding")
        
        # Retourner le résultat
        result = {
            'embedding': embedding,
            'dimensions': len(embedding),
            'model': 'all-MiniLM-L6-v2'
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        logging.error(f"Script error: {e}")
        error_result = {
            'error': str(e),
            'embedding': None
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()