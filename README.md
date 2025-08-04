# :video_game: Quest generator based on user requests

**Quest Generator** is a technology that generates quests for RPG and RPG-like games from scratch using a Large Language Model (LLM).

# :page_facing_up: Overview

> Quest Generator helps game designers and scriptwriters in their work.

**Summary of Quest Generator**: a txt file (genre, main character, purpose) is accepted as input. Based on this, the programme generates a complete description of the quest in JSON format. The main variables of the JSON file are: _scene_id_, _text_, _choices_, _next_scene_. 

The quest has 5-10 scenes, there are plot branches, the depth of one branch (apart from the main one) is at least 3 scenes. 

# :paperclip: How to Install and Run 

You can **download the service** using this [link](https://github.com/Gjils/gamedev-ai-2025). The link leads to the repository. To run the project locally, you need to clone the repository to yourself (via ``git clone [ssh\https]`` in your Terminal. Use the method that is more convenient for you).

After that, **please receive your authentication code from [GigaChat API](https://developers.sber.ru/portal/gigachat-and-api)**. This [video](https://youtu.be/HAg-GFKl1rc?si=8ycwwz9qZYffwIks) (video in Russian) contains simple instructions on how to get an authentication code. **Then create the .env file in the cloned repository and put your code there according to the template ``GIGACHAT_CREDENTIALS = "your authentication code from GigaChat API"``.**

You need to run the service via Docker (make sure it is installed on your PC). After you have cloned the repository to yourself and get an authentication code in .env file, you need to "build" the project. 

Launch your Terminal. There, navigate to the folder where the repository is located. Run the `docker compose up --build` command. After that, you can launch the project via the Docker desktop application (or just go to ```http://localhost:3000``` , here is a website with _Quest Generator_).

# :bulb: How to Use 

1. After executing ``docker compose up --build`` open the website ``http://localhost:3000``.
2. On this website, you need to enter the initial parameters of your RPG quest: Quest ID, genre, main character, purpose. 
3. After that, a quest and a graph illustrating the plot forks will be generated. 
4. Clicking on the graph element opens a text describing the plot and a description of the plot choices leading to further forks.
5. The quest will be saved as a JSON file (look at your folder with downloads).

# :dizzy: Authors
* [Alexey Preobrzhenskiy](https://github.com/Gjils)
* [Anna Onufrienko](https://github.com/osisochka)
* [Glafira Averbakh](https://github.com/firadaro)
