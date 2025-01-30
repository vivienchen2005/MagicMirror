import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from supabase import create_client, Client


# Set up Flask app
app = Flask(__name__)

load_dotenv()

# Get Supabase credentials from env file
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_STORAGE_BUCKET = os.getenv("SUPABASE_STORAGE_BUCKET")

# Create Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Sample route
@app.route('/')
def home():
    return jsonify({'message': 'Welcome to Magic Mirror Flask API'})



### POST

@app.route('/app/clothing-items', methods=['POST'])
def add_clothing_item():
    try:
        data = request.json

        name = data.get("name")
        category = data.get("category")
        brand = data.get("brand")
        size = data.get("size")
        image_url = data.get("image_url")
        clothing_type = data.get("clothing_type")

        if not name or not category or not clothing_type or not image_url:
            return jsonify({"error": "Invalid Input. Clothing item must have name, category, and image."}), 400
        
        response = supabase.table("clothing-items").insert({
            "name": name,
            "clothing_type": clothing_type,
            "category": category,
            "brand": brand,
            "size": size,
            "image_url": None
        }).execute()

        if not response.data:
            return jsonify({"error": "Failed to insert clothing item"}), 500

        clothing_id = response.data[0]["id"]
        filename = f"{clothing_id}.png"
        image_path = f"{SUPABASE_STORAGE_BUCKET}/{filename}"

        r = requests.get(image_url)
        supabase.storage.from_(SUPABASE_STORAGE_BUCKET).upload(image_path, image_url.read(), content_type="image/png")
        final_image_url = supabase.storage.from_(SUPABASE_STORAGE_BUCKET).get_public_url(image_path)

        supabase.table("clothing-items").update({"image_url": image_url}).select("*").eq("id", clothing_id).execute()

        return jsonify({
            "message": "Clothing item added",
            "item": {
                "id": clothing_id,
                "name": name,
                "clothing_type": clothing_type,
                "category": category,
                "brand": brand,
                "size": size,
                "image_url": image_url
            }
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


### GET

# clothing id -> clothing item
@app.route('/clothing-items', methods=['GET'])
def test_query():
    try:
        clothing_id = int(request.args.get("clothing_id")) 
        name = request.args.get("name")
        category = request.args.get("category")
        clothing_type = request.args.get("clothing_type")

        query = supabase.table("clothing-items").select("*")

        if clothing_id:
            query = query.eq("id", clothing_id)
        elif name:
            query = query.eq("name", name)
        elif category:
            query = query.eq("category", category)
        elif clothing_type:
            query = query.eq("clothing_type", clothing_type)
        else:
            return jsonify({"error": "Invalid Input. Must have id, name, category, or type."}), 400

        response = query.execute()

        if not response.data:
            return jsonify({"error": "No items found."}), 404

        return jsonify(response.data), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


### DELETE

@app.route('/app/clothing-items/<int:clothing_id>', methods=['DELETE'])
def delete_clothing_item(clothing_id):
    try:
        # Validate if item present
        response = supabase.table("clothing-items").select("*").eq("id", clothing_id).execute()

        if not response.data:
            return jsonify({"error": f"Clothing item with ID {clothing_id} does not exist."}), 404

        # extract image url for supabase bucket deletion
        image_url = response.data[0].image_url
            
        delete_response = supabase.table("clothing-items").delete().eq("id", clothing_id).execute()

        if not delete_response.data:
            return jsonify({"error": "Failed to delete item"}), 500
        
        if image_url:
            image_path = image_url.split(f"/{SUPABASE_STORAGE_BUCKET}/")[-1] 
            supabase.storage.from_(SUPABASE_STORAGE_BUCKET).remove([image_path])
        

        return jsonify({"message": f"Clothing item {clothing_id} deleted successfully."})

    except Exception as e:
        return jsonify({"error": str(e)}), 500



if __name__ == '__main__':
    app.run(debug=True)  # Runs the server in debug mode

