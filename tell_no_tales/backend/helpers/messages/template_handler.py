from jinja2 import Environment, FileSystemLoader, Template
import os

class TemplateHandler():
    def __init__(self):
        path_to_here = os.path.dirname(__file__)
        self.template_dir = os.path.join(path_to_here, 'templates')
        self.env = Environment(loader=FileSystemLoader(self.template_dir))
        self.available_templates = self.get_html_template_names()

    def get_html_template_names(self):
        template_names = list()

        for template_name in os.listdir(self.template_dir):
            if template_name.endswith('html'):
                template_names.append(template_name)

        return template_names

    def render_template(self, template_name, context):
        if template_name not in self.available_templates:
            print("Template name not recognised")
            return None

        template = self.env.get_template(template_name)
        return template.render(context)

if __name__ == '__main__':
    handler = TemplateHandler()

    names = handler.get_html_template_names()
    print(names)
    
    rendered = handler.render_template("notify.html", {'var1':1, 'var2':2})
    print(rendered)
