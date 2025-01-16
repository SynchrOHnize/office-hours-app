import os

def print_directory_structure(directory, indent=0):
    # Change directory to system root
    try:
        # List all files and directories in the current directory
        items = os.listdir(directory)
        ignore_list = ['.git', '.DS_Store', '.vscode', '.idea', '.env', '.env.local', '.env.development', '.env.production', '.env.test', '.env.development.local', '.env.production.local', '.env.test.local', 'node_modules']
        for item in items:
            if item in ignore_list:
                continue
            # Print the item with indentation
            print(' ' * indent + '|-- ' + item)
            # Get the full path
            path = os.path.join(directory, item)
            # If it's a directory, recursively call the function
            if os.path.isdir(path):
                print_directory_structure(path, indent + 4)
    except PermissionError:
        print(' ' * indent + '|-- [Permission Denied]')

if __name__ == "__main__":
    # Input the directory to list
    os.chdir('/Users')
    print("Current directory: ", os.getcwd())
    target_directory = input("Enter the directory path to list its structure: ").strip()
    if os.path.exists(target_directory):
        print(f"Directory structure of: {target_directory}")
        print_directory_structure(target_directory)
    else:
        print(f"Error: The directory '{target_directory}' does not exist.")