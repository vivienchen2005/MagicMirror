from flask import request, jsonify
from . import app, supabase, SUPABASE_STORAGE_BUCKET
import requests



# Sample route
@app.route('/')
def home():
    return jsonify({'message': 'Welcome to Magic Mirror Flask API'})



### POST

@app.route('/clothing-items', methods=['POST'])
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
            "image_url": image_url
        }).execute()

        if not response.data:
            return jsonify({"error": "Failed to insert clothing item"}), 500

        clothing_id = response.data[0]["id"]

        upload_url = f"{clothing_id}.png"
        # final_image_url = f"clothing-images/{upload_url}"
        # final_image_url = upload_url

        with open(image_url, 'rb') as f:
            response = supabase.storage.from_("clothing-images").upload(
                file=f,
                path=upload_url,
                file_options={"cache-control": "3600", "upsert": "false"},
            )

            if not response.path:
                return jsonify({"error": "Failed to store image."}), 500
                

        final_image_url = f"clothing-images/{upload_url}"

        supabase.table("clothing-items").update({"image_url": final_image_url}).eq("id", clothing_id).execute()


        return jsonify({
            "message": "Clothing item added",
            "item": {
                "id": clothing_id,
                "name": name,
                "clothing_type": clothing_type,
                "category": category,
                "brand": brand,
                "size": size,
                "image_url": upload_url
            }
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


### GET
# clothing id -> clothing item
@app.route('/clothing-items', methods=['GET'])
def get_clothing():
    try:
        clothing_id = request.args.get("clothing_id")
        name = request.args.get("name")
        category = request.args.get("category")
        clothing_type = request.args.get("clothing_type")

        query = supabase.table("clothing-items").select("*")

        if clothing_id:
            query = query.eq("id", int(clothing_id))
        elif name:
            query = query.eq("name", name)
        elif category:
            query = query.eq("category", category)
        elif clothing_type:
            query = query.eq("clothing_type", clothing_type)

        response = query.execute()

        if not response.data:
            return jsonify({"error": "No items found."}), 404
        
        # Return a single item if searching by clothing_id
        if clothing_id:
            return jsonify(response.data[0]), 200

        return jsonify(response.data), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


### DELETE
@app.route('/clothing-items/<int:clothing_id>', methods=['DELETE'])
def delete_clothing_item(clothing_id):
    try:
        # Validate if item present
        response = supabase.table("clothing-items").select("*").eq("id", clothing_id).execute()

        if not response.data:
            return jsonify({"error": f"Clothing item with ID {clothing_id} does not exist."}), 404

        # extract image url for supabase bucket deletion
        image_url = response.data[0].get("image_url", None) 
            
        delete_response = supabase.table("clothing-items").delete().eq("id", clothing_id).execute()

        if not delete_response.data:
            return jsonify({"error": "Failed to delete item"}), 500
        
        if image_url:
            image_path = image_url.split(f"clothing-images/")[-1] 
            supabase.storage.from_(SUPABASE_STORAGE_BUCKET).remove([image_path])
        

        return jsonify({"message": f"Clothing item {clothing_id} deleted successfully."})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

